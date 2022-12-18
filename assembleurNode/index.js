import assemblerFichier from "./assembleur.js"


const [,,entree,sortie] = process.argv;
try{
    if(!entree)throw new Error("Fichier manquant !")
    await assemblerFichier(entree,sortie || "outPrgm.txt")
}
catch(e){
    console.log(e.message)
}
