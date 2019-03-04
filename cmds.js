//Ahora importamos out.js de otra manera
const {log, biglog, errorlog, colorize} = require("./out");

// Require con ./ es porque se trata de un fichero local
const model = require('./model');

exports.helpCmd = rl => {
      log('Comandos: ');
      log(' h|help -> Muestra esta ayuda.');
      log(' list -> Listar los quizzes existentes.');
      log(' show <id> -> Muestra la pregunta y la respuesta del quiz indicado');
      log(' delete<id> -> Borrar el quiz indicado.');
      log(' edit <id> -> Editar el quiz indicado.');
      log(' test <id> -> Probar el quiz indicado.');
      log(' p|play -> Jugar a preguntar aleatoriamente todos los quizzes.');
      log(' credits -> Creditos');
      log(' q|quit -> Salir del programa.');
      rl.prompt();
}


/*
*
*
*/

exports.listCmd = rl => {

    model.getAll().forEach((quiz, id) => {
        log(` [${colorize(id, 'magenta')}]: ${quiz.question}`);
    }); 
    rl.prompt();
};



/*
* Para ver la respuesta de cada pregunta
* En funcion del id
*/
exports.showCmd = (rl, id) => {
    
    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id`);
    }else{
        try{
            const quiz = model.getByIndex(id);
            log(` [${colorize(id, 'magenta')}]: ${quiz.question} ${colorize('=>', 'magenta')} ${quiz.answer}`);
        } catch(error) {
            errorlog(error.message);
        }
    }

    rl.prompt();

};



/*
* Comportamiento asincrono
* Para añadir quizzes nuevos y sus respuestas
* El funcionamiento de rl.question es asincron
* El prompt hay que sacarlo cuando ya se ha terminado la interaccion con el usuario,
* es decir, la llamada rl.prompt() se debe hacer en la callback de la segunda
* llamada a rl.question()
*/
exports.addCmd = rl => {

    rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
        rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {

            model.add(question,answer);
            log(` ${colorize('Se ha añadido', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);
            rl.prompt();
        });
    });
    
};


exports.deleteCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id`);
    }else{
        try{
             model.deleteByIndex(id);
        } catch(error) {
            errorlog(error.message);
        }
    }

    rl.prompt();

};




/*
*
*
*
*/
exports.editCmd = (rl, id) => {
    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id.`);
        rl.prompt();
    } else {
        try {

            const quiz = model.getByIndex(id);

            process.stdout.isTTY && setTimeout(() => {rl.write(quiz.question)},0);

            rl.question(colorize(' Introduzca una pregunta: ', 'red'), question => {
            
                process.stdout.isTTY && setTimeout(() => {rl.write(quiz.answer)},0);

                rl.question(colorize(' Introduzca la respuesta: ', 'red'), answer => {
                    model.update(id, question, answer);
                    log(` ${colorize('Se ha cambiado', 'magenta')}: ${question} ${colorize('=>', 'magenta')} ${answer}`);

        });
    });
    } catch(error){
        errorlog(error.message);
        rl.prompt();
    }
}
};




/*
*
*
*
*/
exports.testCmd = (rl, id) => {

    if (typeof id === "undefined") {
        errorlog(`Falta el parametro id.`);
        rl.prompt();
    } else {
        try {

            const quiz = model.getByIndex(id);
            rl.question(quiz.question + '? ', answer => {
                if (quiz.answer.trim().toLowerCase() == answer.trim().toLowerCase()) {
                    log('CORRECTO', 'green');
                    rl.prompt();
                }else{
                    log('INCORRECTO', 'red');
                    rl.prompt();
                }
            });
        } catch(error){
            errorlog(error.message);
            rl.prompt();
        }
    
}
};


exports.playCmd = rl => {

    let score = 0 //variable que almacena aciertos
    let toBeResolved = []; 

    model.getAll().forEach(quiz => {
        toBeResolved.push(quiz);
    });
    playOne(toBeResolved, score, rl);

}





const playOne = (toBeResolved, score, rl) => {
    try {
        if (toBeResolved.length == 0) {
            log('SE FINI');
            rl.prompt();
        } else {

            // Coger un id al azar
            let id = parseInt(Math.random()*toBeResolved.length);

            const quiz = toBeResolved[id];
            rl.question(quiz.question + '? ', answer => {
                if (quiz.answer.trim().toLowerCase() == answer.trim().toLowerCase()) {
                    score++;
                    biglog('CORRECTO', 'green');
                    biglog('Llevas ' + score + ' aciertos', 'blue');
                    toBeResolved.splice(id, 1);
                    // Hacemos una llamada recursiva
                    playOne(toBeResolved, score, rl);
                }else{
                    biglog('INCORRECTO', 'red');
                    biglog('Has conseguido ' + score + ' aciertos', 'blue');
                    log('Fin del juego');
                    rl.prompt();
                }
            });

        }
    } catch(error) {
            errorlog(error.message);
            rl.prompt();
        }
}




exports.creditsCmd = rl => {
    log('Autor', 'green');
    log('Nombre', 'green');
    rl.prompt();

}



exports.quitCmd = rl => {
    rl.close();
}

