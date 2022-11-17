export type registreType = "R0" | "R1" | "R2" | "R3" | "R4" | "R5" | "R6" | "R7"

export const listeRegistres = new Map<registreType, number>()
listeRegistres.set("R0", 0x0)
listeRegistres.set("R1", 0x1)
listeRegistres.set("R2", 0x2)
listeRegistres.set("R3", 0x3)
listeRegistres.set("R4", 0x4)
listeRegistres.set("R5", 0x5)
listeRegistres.set("R6", 0x6)
listeRegistres.set("R7", 0x7)
