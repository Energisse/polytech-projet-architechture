import { promises as fs } from "fs";
const commentaire = "#";

export default async function assemblerFichier(fichierIn, fichierOut) {
  const fichier = await fs
    .readFile(fichierIn)
    .then((fichier) => fichier.toString())
    .catch(() => {
      throw new Error("Fichier introuvable !");
    });
  fs.writeFile(fichierOut, "v2.0 raw\n" + assembler(fichier));
}
export function assembler(assembleur) {
  const labels = new Map();
  const lignes = assembleur.split("\n");
  let positionLigne = 0;
  const operations = [];

  lignes.forEach((ligne, indiceLigne) => {
    try {
      const ligneInstruction = ligne.split(commentaire)[0].trim();

      //ligneVide
      if (!ligneInstruction) return;

      const ligneDeCode = ligneInstruction.split(":");

      //Il y a plus de 2 ":"
      if (ligneDeCode.length > 2) {
        throw new Error(
          ligne +
            "\n" +
            "^".padStart(ligneDeCode[0].length + ligneDeCode[1].length +3)
        );
      }

      let label;
      let operartion;
      let resgistres;

      if (ligneDeCode.length == 1) {
        [operartion, ...resgistres] = ligneDeCode[0].split(" ");
      } else {
        [operartion, ...resgistres] = ligneDeCode[1].trim().split(" ");
        label = ligneDeCode[0].trim();
        if (!checkLabel(label)) throw new Error(`Label incorrecte`);
        if (labels.get(label) != undefined) {
          throw new Error(`Label déjà existant`);
        }
        labels.set(label, positionLigne);
      }
      operations.push({
        params: resgistres,
        ligneRelative: positionLigne,
        ligneAbsolue: indiceLigne,
        operartion: listeInstructions.get(operartion),
        ligne: ligne,
      });
      positionLigne++;
    } catch (error) {
      throw new Error(
        "Erreur à la ligne " +
          (indiceLigne+1) +
          " : " +
          ligne +
          "\n " +
          error.message
      );
    }
  });
  return operations
    .map(({ params, ligneRelative, ligneAbsolue, operartion, ligne }) => {
      try {
        return operartion.encode(params, labels, ligneRelative).toString(16);
      } catch (error) {
        throw new Error(
          "Erreur à la ligne " +
            (ligneAbsolue+1) +
            " : " +
            ligne +
            "\n " +
            error.message
        );
      }
    })
    .join(" ");
}

export function checkLabel(label) {
  return /^[a-zA-Z][a-zA-Z0-9]*$/.test(label);
}

class Instruction {
  constructor(nom, codeHexa) {
    this.nom = nom;
    this.codeHexa = codeHexa;
  }
}

class InstructionUAL extends Instruction {
  constructor(nom, codeHexa) {
    super(nom, codeHexa);
    this.immediat = nom.endsWith("i");
  }
  encode(parametres) {
    if (parametres.length != 3)
      throw new Error(`3 paramètres sont nécessaire pour : ${this.nom} `);
    const params =
      getRegistre(parametres[0]) +
      (getRegistre(parametres[1]) << 3) +
      ((this.immediat
        ? getConstante(parametres[2])
        : getRegistre(parametres[2])) <<
        6);
    return (params << 6) + (this.immediat << 5) + (this.codeHexa << 2);
  }
}

class InstructionMem extends Instruction {
  encode(parametres) {
    if (parametres.length != 2)
      throw new Error(`2 paramètres sont nécessaire pour : ${this.nom} `);
    const params =
      getRegistre(parametres[0]) + (getRegistre(parametres[1]) << 3);
    return (params << 6) + (this.codeHexa << 2) + 1;
  }
}

class InstructionCTRLCond extends Instruction {
  encode(parametres, labels) {
    if (parametres.length != 3)
      throw new Error(`3 paramètres sont nécessaire pour : ${this.nom} `);
    if (!labels.has(parametres[2]))
      throw new Error(`Label : ${parametres[2]} inexistant`);
    const params =
      getRegistre(parametres[0]) +
      (getRegistre(parametres[1]) << 3) +
      (labels.get(parametres[2]) << 6);
    return 3 + (this.codeHexa << 2) + (params << 6);
  }
}

class InstructionCTRLDeplacement extends Instruction {
  encode(parametres, labels) {
    if (parametres.length != 1)
      throw new Error(`1 paramètre est nécessaire pour : ${this.nom} `);
    if (!labels.has(parametres[0]))
      throw new Error(`Label : ${parametres[0]} inexistant`);
    const params = labels.get(parametres[0]) << 6;
    return 3 + (this.codeHexa << 2) + (params << 6);
  }
}

class InstructionCTRLRET extends Instruction {
  encode(parametres, labels) {
    if (parametres.length != 0)
      throw new Error(`0 paramètres nécessaire : ${this.nom} `);
    return 3 + (this.codeHexa << 2);
  }
}

class InstructionCTRLSTOP extends Instruction {
  encode(parametres, labels, pos) {
    if (parametres.length != 0)
      throw new Error(`0  paramètres nécessaire : ${this.nom} `);
    return 3 + (this.codeHexa << 2) + (pos << 12);
  }
}

const listeInstructions = new Map();
listeInstructions.set("ADD", new InstructionUAL("ADD", 0));
listeInstructions.set("ADDi", new InstructionUAL("ADDi", 0));
listeInstructions.set("SUB", new InstructionUAL("SUB", 1));
listeInstructions.set("SUBi", new InstructionUAL("SUBi", 1));
listeInstructions.set("MUL", new InstructionUAL("MUL", 2));
listeInstructions.set("MULi", new InstructionUAL("MULi", 2));
listeInstructions.set("AND", new InstructionUAL("AND", 3));
listeInstructions.set("ANDi", new InstructionUAL("ANDi", 3));
listeInstructions.set("OR", new InstructionUAL("OR", 4));
listeInstructions.set("ORi", new InstructionUAL("ORi", 4));
listeInstructions.set("XOR", new InstructionUAL("XOR", 5));
listeInstructions.set("XORi", new InstructionUAL("XORi", 5));
listeInstructions.set("SL", new InstructionUAL("SL", 6));
listeInstructions.set("SLi", new InstructionUAL("SLi", 6));
listeInstructions.set("SR", new InstructionUAL("SR", 7));
listeInstructions.set("SRi", new InstructionUAL("SRi", 7));
/* INSTRUCTION MEMEMOIRE << 2 + 0x01 */
listeInstructions.set("STR", new InstructionMem("STR", 0));
listeInstructions.set("LD", new InstructionMem("LD", 1));
/* INSTRUCTION CTRL << 2 + 0x11 */
listeInstructions.set("JEQU", new InstructionCTRLCond("JEQU", 0));
listeInstructions.set("JINF", new InstructionCTRLCond("JINF", 1));
listeInstructions.set("JSUP", new InstructionCTRLCond("JSUP", 2));
listeInstructions.set("JNEQ", new InstructionCTRLCond("JNEQ", 3));
listeInstructions.set("JMP", new InstructionCTRLDeplacement("JMP", 4));
listeInstructions.set("CALL", new InstructionCTRLDeplacement("CALL", 5));
listeInstructions.set("RET", new InstructionCTRLRET("RET", 6));
//Agit comme un jump mais sur lui meme
listeInstructions.set("STOP", new InstructionCTRLSTOP("STOP", 4));

export function getRegistre(registre) {
  const match = registre.match(/^R([0-7])$/);
  if (match == null) throw new Error(`Le registre ${registre} n'existe pas !`);
  return +match[1];
}

export function getConstante(constante) {
  const result = parseInt(constante);
  if (isNaN(result)) throw new Error(`${constante} n'est pas une constante' !`);
  return result;
}
