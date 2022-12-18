operations = ("ADD", "SUB", "MUL", "AND", "XOR", "OR", "SL", "SR",
              "STR", "LD",
              "JEQU", "JINF", "JSUP", "JNEQ", "JMP", "CALL", "RET")
opIndex = ("000", "001", "010", "011", "101", "100", "110", "111",
           "000", "001",
           "000", "001", "010", "011", "100", "101", "110")
opType = ("00", "00", "00", "00", "00", "00", "00", "00",
          "01", "01",
          "11", "11", "11", "11", "11", "11", "11")

print("Ce programme permet de transformer un code assembleur en code compréhensible par Logisim."
      +"\nIl suffit pour cela d'entrer le chemin absolu du fichier comprenant le code assembleur à la ligne ci-dessous."
      +" Ce programme créera un fichier nommé \"outprgm.txt\", lisible par Logisim.")
path = input("Chemin absolu : ")
inFile = open(path, "r")

# Pour remettre la sortie au même endroit que l'entrée
if "/" in path:
    outFilePos = path[:path.rfind("/")] + "/"
else:
    outFilePos = path[:path.rfind("\\")] + "\\"

outtxt = "v2.0 raw\n"
outFile = open(outFilePos + "outprgm.txt", "w")

nbLines = 0
labels = []
lines = []

for l in inFile: # Chaque ligne du fichier
    # Si elle fini par "\n", on enlève le "\n"
    if (l[-1] == "\n"):
        l = l[:-1]

    # Gestion des commentaires : Séparer entre avant "#" et après "#"
    if ("#" in l):
        l = l.split("#")[0]

    # Gestion des labels : Séparer entre avant ":" et après ":"
    if (":" in l):
        a = l.split(":")
        l = a[1].replace("\t", "")
        labels.append([a[0].replace(" ", ""), nbLines])

    sepL = l.split(" ")
    sepL = ' '.join(sepL).split()

    if (len(sepL) > 0):
        nbLines += 1
        lines.append(l)

inFile.close()


# Pour chaque ligne épurée : 
for l in lines:
    # Découpage de la ligne
    inParts = l.split(" ")
    # Enlever les espaces en trop
    inParts = ' '.join(inParts).split()
    # Sortie découpée par partie
    outParts = []

    if (len(inParts) > 0):
        # L'opération est le premier élément :
        isOp = False
        for i in range(len(operations)):
            if (operations[i] in inParts[0] and isOp == False):
                # On enregistre le type (UAL/MEM/...) et l'index (ADD/OR/JEQU/...)de l'opération
                outParts.append(opType[i])
                outParts.append(opIndex[i])
                # Si y'a un "i" : Opération immédiate
                if ("i" in inParts[0]):
                    outParts.append("1")
                else:
                    outParts.append("0")
                isOp = True
        inParts.pop(0)
        
        # Pour chaque morceau de la ligne sauf l'opération
        for part in inParts:
            # Si c'est l'adresse d'un registre :
            if (part[0] == "R" and part[1] >= "0" and part[1] <= "8"):
                # part = "RX" -> On récupère X :
                rx = "{0:b}".format(int(part[1]))
                # On rajoute les 0 devants :
                while (len(rx) < 3):
                    rx = "0" + rx
                outParts.append(rx)
            # C'est une constante ou un nom de label
            else:
                # On cherche si c'est un nombre : constante
                isNumber = True
                for c in part:
                    # On regarde si chaque élément du morceau est un chiffre :
                    if (c < "0" or c > "9"):
                        isNumber = False
                # Si c'est une constante
                if (isNumber == True):
                    # On récupère sa valeur en binaire
                    const = "{0:b}".format(int(part))
                    while (len(const) < 16):
                        const = "0" + const
                    outParts.append(const)
                # Sinon, c'est un label
                else:
                    for label in labels:
                        if (part == label[0]): # On a trouvé le label
                            lab = "{0:b}".format(int(label[1])) # On recupère le numero de la ligne du label
                            while (len(lab) < 16):
                                lab = "0" + lab
                            if len(outParts) == 3: # Si pas de registre : on met des vides à la place
                                outParts.append("000")
                                outParts.append("000")
                            outParts.append(lab)
        
        # Ecriture de la ligne dans le bon sens
        outLine = ""
        for outPart in outParts:
            outLine = outPart + outLine
        # Completer la ligne jusqu'à 32 caractères
        while (len(outLine) < 32):
            outLine = "0" + outLine
        # Ecriture de la ligne en hexadécimal (le [2:] c'est pour enlever le "0x")
        print(outLine)
        outtxt += hex(int(outLine, 2))[2:] + " "

print(outtxt)
outFile.write(outtxt)
outFile.close()
            
