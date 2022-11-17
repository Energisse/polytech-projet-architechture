import { promises as fs } from 'fs'
import { types } from "util"
import listeInstructions from "./instructions"
import { checkLabel } from './labels';
const commentaire = "#";

(async () => {
    try {
        const fichier = await lireFichier("./test.txt")
        const lignes = fichier.split("\n")
        let positionLigne = -1
        const lignesDecoupe = lignes.map((ligne, indiceLigne) => {
            try {
                // console.log(`[${indiceLigne}] ${ligne}`)

                const ligneDeCode: Array<string> = ligne.split(commentaire)[0].trim().split(":")

                //ligneVide
                if (!ligneDeCode[0]) return;
                //Il y a plus de 2 ":"
                if (ligneDeCode.length > 2) {
                    throw new Error(ligne + "\n" + "^".padStart(ligneDeCode[0].length + ligneDeCode[1].length + 2))
                }
                positionLigne++
                if (ligneDeCode.length == 1) {
                    const [operartion, ...resgistres] = ligneDeCode[0].split(" ")
                    const instruction = listeInstructions.get(operartion)
                    if (instruction) {
                        return () => instruction.encode(resgistres, labels).toString(16)
                    }
                    else {
                        throw new Error(`Instructuion inconnu`)
                    }
                }
                else {
                    let [label] = ligneDeCode;
                    label = label.trim()
                    if (!checkLabel(label)) throw new Error(`Label incorrecte`)
                    console.log(labels, label)
                    if (labels.get(label) != undefined) {
                        throw new Error(`Label deja existant`)
                    }
                    labels.set(label, positionLigne);
                    const [operartion, ...resgistres] = ligneDeCode[1].trim().split(" ")
                    const instruction = listeInstructions.get(operartion)
                    if (instruction) {
                        return () => instruction.encode(resgistres, labels).toString(16)
                    }
                    else {
                        throw new Error(`Instructuion inconnu`)
                    }
                }
            } catch (error) {
                throw new Error(`Erreur a la ligne ${indiceLigne} : "${ligne}" \n${(error as Error).message}`)
            }
        })
            .filter(<(ligne: any) => ligne is () => string>(ligne => ligne != undefined))
            .map((encode) => encode())
            .reduce((prev, cur) => prev + " " + cur, "");

        console.log(lignesDecoupe)
    }
    catch (e) {
        // console.log(e)
        console.error((e as Error).message)
    }
})()

async function lireFichier(nom: string) {
    return fs.readFile(nom).then(fichier => fichier.toString());
}


const labels = new Map<string, number>()

function getLabels(label: string) {

}