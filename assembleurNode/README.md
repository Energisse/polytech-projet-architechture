# Assembleur Nodejs

## Installation

Ce projet nécessite d'installer NodeJs ( >= 16.15.0 )

https://nodejs.org/en/download/

Installation des pacquets de développement

```
npm i
```

## Exécution

```
npm start {entrée} {sortie?}
```

- ```entrée``` : fichier assembleur
- ```sortie``` : fichier assemblé (par defaut ```outPrgm.txt```)

## Tests

```
npm test
```

Les tests de codes sont regroupé par dossier dans ```tests/codes/*```, il utilise le fichier ```circuit.circ``` pour tester le circuit. 
- ```config.json``` : fichier de configuration du test
  - ```name``` : nom du test   
  - ```co``` : les valeurs du compteur ordinal à chaque changement d'état du circuit   
  - ```result``` : les valeurs des registres à chaque changement d'état du circuit
- ```prog.txt``` : code assembleur (
- ```result.txt``` : code assembleur assemblé (généré automatiquement, utilisable sur logisim)

> **Warning**
> Tous les codes de tests doivent se terminer par un JMP sur eux même ou par l'instruction ```STOP```, sinon les tests ne se termineront jamais.