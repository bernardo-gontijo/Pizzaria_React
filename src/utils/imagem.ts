// Comprime uma imagem no navegador (via <canvas>) antes de convertê-la
// para uma data URL base64. Usado sempre que uma imagem enviada pelo
// usuário precisa ser persistida como base64 (ex: localStorage), onde
// o tamanho do arquivo original importa muito mais do que a resolução
// real necessária para exibição.
//
// Estratégia: redimensiona para caber dentro de larguraMaxima x
// alturaMaxima (mantendo a proporção) e reduz a qualidade JPEG até o
// resultado caber no limite de bytes informado, tentando algumas
// qualidades decrescentes antes de desistir.

interface OpcoesCompressao {
  larguraMaxima?: number;
  alturaMaxima?: number;
  tamanhoMaximoBytes?: number;
}

const QUALIDADES_TENTATIVAS = [0.85, 0.7, 0.55, 0.4, 0.25];

function carregarImagem(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagem = new Image();
    imagem.onload = () => resolve(imagem);
    imagem.onerror = () => reject(new Error("Não foi possível ler a imagem."));
    imagem.src = dataUrl;
  });
}

function lerArquivoComoDataUrl(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => resolve(leitor.result as string);
    leitor.onerror = () =>
      reject(new Error("Não foi possível ler esse arquivo."));
    leitor.readAsDataURL(arquivo);
  });
}

function calcularDimensoes(
  larguraOriginal: number,
  alturaOriginal: number,
  larguraMaxima: number,
  alturaMaxima: number,
): { largura: number; altura: number } {
  const escala = Math.min(
    1, // nunca aumenta uma imagem menor que o limite
    larguraMaxima / larguraOriginal,
    alturaMaxima / alturaOriginal,
  );

  return {
    largura: Math.round(larguraOriginal * escala),
    altura: Math.round(alturaOriginal * escala),
  };
}

function canvasParaDataUrl(
  canvas: HTMLCanvasElement,
  qualidade: number,
): string {
  // JPEG comprime muito melhor que PNG para fotos; como o canvas
  // descarta transparência ao desenhar sobre fundo branco, isso é
  // seguro mesmo para logos/PNGs com fundo transparente.
  return canvas.toDataURL("image/jpeg", qualidade);
}

function tamanhoBytesDeDataUrl(dataUrl: string): number {
  // Cada 4 caracteres base64 representam 3 bytes originais; o "," separa
  // o cabeçalho "data:...;base64," do conteúdo.
  const base64 = dataUrl.split(",")[1] ?? "";
  return Math.ceil((base64.length * 3) / 4);
}

/**
 * Lê um arquivo de imagem, redimensiona e comprime até caber no limite
 * de tamanho informado, retornando a data URL (base64) final.
 *
 * Lança um erro se, mesmo na qualidade mais baixa testada, o resultado
 * ainda ultrapassar o limite — nesse caso quem chamou deve pedir uma
 * imagem menor ou de resolução mais baixa.
 */
export async function comprimirImagem(
  arquivo: File,
  opcoes: OpcoesCompressao = {},
): Promise<string> {
  const {
    larguraMaxima = 1200,
    alturaMaxima = 1200,
    tamanhoMaximoBytes = 400 * 1024, // 400 KB após compressão
  } = opcoes;

  const dataUrlOriginal = await lerArquivoComoDataUrl(arquivo);
  const imagem = await carregarImagem(dataUrlOriginal);

  const { largura, altura } = calcularDimensoes(
    imagem.naturalWidth,
    imagem.naturalHeight,
    larguraMaxima,
    alturaMaxima,
  );

  const canvas = document.createElement("canvas");
  canvas.width = largura;
  canvas.height = altura;

  const contexto = canvas.getContext("2d");

  if (!contexto) {
    throw new Error("Não foi possível processar essa imagem neste navegador.");
  }

  // Fundo branco antes de desenhar: evita que transparência (PNG) vire
  // preto ao converter para JPEG, que não suporta canal alfa.
  contexto.fillStyle = "#ffffff";
  contexto.fillRect(0, 0, largura, altura);
  contexto.drawImage(imagem, 0, 0, largura, altura);

  for (const qualidade of QUALIDADES_TENTATIVAS) {
    const dataUrlComprimida = canvasParaDataUrl(canvas, qualidade);

    if (tamanhoBytesDeDataUrl(dataUrlComprimida) <= tamanhoMaximoBytes) {
      return dataUrlComprimida;
    }
  }

  // Chegou aqui sem nenhum "return" acima: nem a qualidade mais baixa
  // testada coube no limite. Deixa o chamador decidir o que fazer
  // (ex: mostrar erro pedindo uma imagem menor).
  throw new Error(
    "Não foi possível comprimir essa imagem o suficiente. Tente uma imagem menor ou com menos detalhes.",
  );
}