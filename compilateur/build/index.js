"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const instructions_1 = __importDefault(require("./instructions"));
const labels_1 = require("./labels");
const commentaire = "#";
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fichier = yield lireFichier("./test.txt");
        const lignes = fichier.split("\n");
        let positionLigne = -1;
        const lignesDecoupe = lignes.map((ligne, indiceLigne) => {
            try {
                // console.log(`[${indiceLigne}] ${ligne}`)
                const ligneDeCode = ligne.split(commentaire)[0].trim().split(":");
                //ligneVide
                if (!ligneDeCode[0])
                    return;
                //Il y a plus de 2 ":"
                if (ligneDeCode.length > 2) {
                    throw new Error(ligne + "\n" + "^".padStart(ligneDeCode[0].length + ligneDeCode[1].length + 2));
                }
                positionLigne++;
                if (ligneDeCode.length == 1) {
                    const [operartion, ...resgistres] = ligneDeCode[0].split(" ");
                    const instruction = instructions_1.default.get(operartion);
                    if (instruction) {
                        return () => instruction.encode(resgistres, labels).toString(16);
                    }
                    else {
                        throw new Error(`Instructuion inconnu`);
                    }
                }
                else {
                    let [label] = ligneDeCode;
                    label = label.trim();
                    if (!(0, labels_1.checkLabel)(label))
                        throw new Error(`Label incorrecte`);
                    console.log(labels, label);
                    if (labels.get(label) != undefined) {
                        throw new Error(`Label deja existant`);
                    }
                    labels.set(label, positionLigne);
                    const [operartion, ...resgistres] = ligneDeCode[1].trim().split(" ");
                    const instruction = instructions_1.default.get(operartion);
                    if (instruction) {
                        return () => instruction.encode(resgistres, labels).toString(16);
                    }
                    else {
                        throw new Error(`Instructuion inconnu`);
                    }
                }
            }
            catch (error) {
                throw new Error(`Erreur a la ligne ${indiceLigne} : "${ligne}" \n${error.message}`);
            }
        })
            .filter((ligne => ligne != undefined))
            .map((encode) => encode())
            .reduce((prev, cur) => prev + " " + cur, "");
        console.log(lignesDecoupe);
    }
    catch (e) {
        // console.log(e)
        console.error(e.message);
    }
}))();
function lireFichier(nom) {
    return __awaiter(this, void 0, void 0, function* () {
        return fs_1.promises.readFile(nom).then(fichier => fichier.toString());
    });
}
const labels = new Map();
function getLabels(label) {
}
