import chai from "chai";
const assert = chai.assert;
import { spawn } from "node:child_process";
import { promises as fs } from "fs";
import assemblerFichier, {
  assembler,
  getRegistre,
  getConstante,
} from "../assembleur.js";

class Operation extends Array {
  constructor(operation) {
    super(
      ...operation
        .split("\t")
        .map((binary) => parseInt(binary.replaceAll(" ", ""), 2))
    );
  }
  getRegistre(n) {
    return this[+n.match(/R(\d+)/)[1] + 2];
  }

  getInstruction() {
    return this[1];
  }

  getCompteurOrdinal() {
    return this[0];
  }
}

function execute(prog) {
  return new Promise((resolve, reject) => {
    const result = [];
    let chaine = "";
    const ls = spawn("java", [
      "-jar",
      "../logisim-generic-2.7.1.jar",
      "../circuit.circ",
      "-tty",
      "table",
      "-load",
      prog,
    ]);
    ls.stdout.on("data", (data) => {
      chaine += data;
    });

    ls.on("close", (code) => {
      const result = chaine.split("\n");
      result.pop();
      resolve(result.map((el) => new Operation(el)));
    });
  });
}

const dossiersTest = await fs.readdir("tests/codes/");
for (let i = 0; i < dossiersTest.length; i++) {
  const result = await fs.readFile(
    "tests/codes/" + dossiersTest[i] + "/config.json",
    { encoding: "utf8" }
  );
  await assemblerFichier(
    "tests/codes/" + dossiersTest[i] + "/prog.txt",
    "tests/codes/" + dossiersTest[i] + "/result.txt"
  );
  const resultLogisim = await execute(
    "tests/codes/" + dossiersTest[i] + "/result.txt"
  );
  const config = JSON.parse(result);
  describe("Test logisim : " +config.name, async () => {
    if(config.result){
      Object.keys(config.result).forEach((key) => {
        it(`${key} = ${config.result[key]}`, () => {
          assert.equal(resultLogisim.at(-1).getRegistre(key),config.result[key]);
        });
      });
    }
    if(config.co){
      it(`${config.co.join("->")}`, () => {
        config.co.forEach((val,indice)=>{
          //x2 car fetch + exec
          assert.equal(resultLogisim.at(indice*2).getCompteurOrdinal(),val);
        })
      });
    }
   
  });
}




describe('Registres', () => { 
    it('Decodage des registres 0-7', () => {
      for(let i = 0; i < 8; i++){
        assert.equal(getRegistre("R"+i), i);
      }
    })
    it("Registre 8 n'existe pas", () => { 
        assert.throws(()=>getRegistre("R8"), Error)
    });
});

describe('Constantes', () => { 
  it('Constante valide', () => {
    assert.equal(getConstante("484898"), 484898);
  })
  it("Constante invalide", () => { 
    assert.throws(()=>getConstante("R484898"), Error);
  });
});

  describe('Syntax', () => { 
    it('Constante non valide', () => {
      assert.throws(()=>assembler("ADDi R0 R0 R0"), Error);
    })
    it('Constante valide', () => {
      assert.equal(assembler("ADDi R0 R0 15"), 0b1111_000_000_1_000_00.toString(16));
    })
    it('Registre non valide', () => {
      assert.throws(()=>assembler("ADD R0 R0 R9"), Error);
    })
    it('Registre valide', () => {
      assert.equal(assembler("ADD R0 R0 R1"), 0b0001_000_000_0_000_00.toString(16));
    })
    it('Registre manquant', () => {
      assert.throws(()=>assembler("ADD R0 R0"), Error);
    })
    it('Constante manquant', () => {
      assert.throws(()=>assembler("ADD R0 R0"), Error);
    })
});

