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
npm start {fichier} {sortie?}
```

## Tests

```
npm test
```

Les tests de codes sont regroupé par dossier dans ```tests/codes/*``` il utilise le fichier ```circuit.circ``` pour exécuter tester le circuit. 
- ```config.json``` : fichier de configuration du test
  - ```name``` : nom du test   
  - ```co``` : les valeurs du compteur ordinal à chaque changement d'état du circuit   
  - ```result``` : les valeurs des registre à chaque changement d'état du circuit
- ```prog.txt``` : code assembleur
- ```result.txt``` : code assembleur assemblé (généré automatiquement, utilisable sur logisim)
