import { listeRegistres, registreType } from "./registres";

type InstructionParametersType = | "Registre" | "Constante" | "Label"
class Instruction {
    nom: string;
    codeHexa: number;
    parametersType: Array<InstructionParametersType>;
    constructor(nom: string, codeHexa: number, parametersType?: Array<InstructionParametersType> | InstructionParametersType) {
        this.nom = nom;
        this.codeHexa = codeHexa;
        this.parametersType = (Array.isArray(parametersType) ? parametersType : (parametersType ? [parametersType] : []))
    }

    encode(parametres: Array<string>, labels: Map<string, number>): number {
        if (parametres.length != this.parametersType.length) throw new Error(`${this.parametersType.length} parametres ${this.parametersType.length > 1 ? "s sont" : " est"}  necessaire pour : ${this.nom} `);

        let parametre = 0;
        let decalage = 0;
        if (parametres.length) {
            parametre = parametres
                .map((parametre, index) => {
                    switch (this.parametersType[index]) {
                        case "Constante":
                            const constante = parseInt(parametre);
                            if (isNaN(constante)) throw new Error(`La constante n'est pas un entier: "${parametre}" `);
                            const valeurConstante = (constante & 0xFFFF) << decalage //On garde uniquement les 16 bits
                            decalage += 16
                            return valeurConstante
                        case "Registre":
                            const registre = listeRegistres.get(parametre as registreType)
                            if (registre === undefined) throw new Error(`Le registre : ${parametre} n'existe pas`);
                            const valeurRegistre = registre << decalage
                            decalage += 3
                            return valeurRegistre
                        case "Label":
                            const labelPosition = labels.get(parametre)
                            if (labelPosition === undefined) throw new Error(`Label : ${parametre} inexistant`)
                            const valeurLabel = (labelPosition & 0xFFFF) << decalage;
                            console.log(labelPosition)
                            decalage += 16
                            return valeurLabel
                    }
                }).reduce((prev, cur) => prev + cur)
        }
        console.log(this.codeHexa.toString(16))
        //Deplacement de 6 bits des registre car 2 bits pour le composant (UAL,MEM...) + 3 bits pour l'operation(ADD,SUB...) + 1 bit pour immediat
        return this.codeHexa + (parametre << 6)
    }
}

type InstructionUalType =
    "ADD" |
    "SUB" |
    "MUL" |
    "AND" |
    "OR" |
    "XOR" |
    "SL" |
    "SR"

type InstructionMemoireType =
    "STR" |
    "LD"

type InstructionsType = `${InstructionUalType}i` | InstructionUalType | InstructionMemoireType | string

const listeInstructions = new Map<InstructionsType, Instruction>()

/* INSTRUCTION UAL << 2 + 0x00. Les instructions avec consante sont immediate + 1<<5*/
listeInstructions.set("ADD", new Instruction("ADD", 0x0, ["Registre", "Registre", "Registre"]))
listeInstructions.set("ADDi", new Instruction("ADDi", 0x20, ["Registre", "Registre", "Constante"]))
listeInstructions.set("SUB", new Instruction("SUB", 0x4, ["Registre", "Registre", "Registre"]))
listeInstructions.set("SUBi", new Instruction("SUBi", 0x24, ["Registre", "Registre", "Constante"]))
listeInstructions.set("MUL", new Instruction("MUL", 0x8, ["Registre", "Registre", "Registre"]))
listeInstructions.set("MULi", new Instruction("MULi", 0x28, ["Registre", "Registre", "Constante"]))
listeInstructions.set("AND", new Instruction("AND", 0xC, ["Registre", "Registre", "Registre"]))
listeInstructions.set("ANDi", new Instruction("ANDi", 0x2C, ["Registre", "Registre", "Constante"]))
listeInstructions.set("OR", new Instruction("OR", 0x10, ["Registre", "Registre", "Registre"]))
listeInstructions.set("ORi", new Instruction("ORi", 0x30, ["Registre", "Registre", "Constante"]))
listeInstructions.set("XOR", new Instruction("XOR", 0x14, ["Registre", "Registre", "Registre"]))
listeInstructions.set("XORi", new Instruction("XORi", 0x34, ["Registre", "Registre", "Constante"]))
listeInstructions.set("SL", new Instruction("SL", 0x18, ["Registre", "Registre", "Registre"]))
listeInstructions.set("SLi", new Instruction("SLi", 0x38, ["Registre", "Registre", "Constante"]))
listeInstructions.set("SR", new Instruction("SR", 0x1c, ["Registre", "Registre", "Registre"]))
listeInstructions.set("SRi", new Instruction("SRi", 0x3c, ["Registre", "Registre", "Constante"]))
/* INSTRUCTION MEMEMOIRE << 2 + 0x01 */
listeInstructions.set("STR", new Instruction("STR", 0x1, ["Registre", "Registre"]))
listeInstructions.set("LD", new Instruction("STR", 0x5, ["Registre", "Registre"]))
/* INSTRUCTION CTRL << 2 + 0x11 */
listeInstructions.set("JEQU", new Instruction("JEQU", 0x3, ["Registre", "Registre", "Label"]))
listeInstructions.set("JINF", new Instruction("JINF", 0x7, ["Registre", "Registre", "Label"]))
listeInstructions.set("JSUP", new Instruction("JSUP", 0xB, ["Registre", "Registre", "Label"]))
listeInstructions.set("JNEQ", new Instruction("JNEQ", 0xF, ["Registre", "Registre", "Label"]))
listeInstructions.set("JUMP", new Instruction("JUMP", 0x13, ["Registre", "Registre", "Label"]))
listeInstructions.set("CALL", new Instruction("CALL", 0x17, "Label"))
listeInstructions.set("RET", new Instruction("RET", 0x1B,))




export default listeInstructions