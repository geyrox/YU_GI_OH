import mysql from 'mysql2'
import express from 'express'
import iniparser from 'iniparser'
import ejs from 'ejs';

const configDB = iniparser.parseSync('./DB.ini')

const app = express()
app.set('view engine', 'ejs')

const mysqlconnexion = mysql.createConnection({
    host: configDB.dev.host,
    user: configDB.dev.user,
    password: configDB.dev.password,
    database: configDB.dev.database
})
mysqlconnexion.connect((err) => {
    if (!err) console.log('BDD connectée.')
    else console.log(`BDD connexion échouée \n Erreur: ${JSON.stringify(err)}`)
})

app.use(express.static('views'));
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }))
app.listen(8000, () => console.log('le serveur YU_GI_OH est prêt.'))

app.get('/', (req, res) => {
    res.send("Yu_Gi_Oh actif, consultez http://localhost:8000/YU_GI_OH/'")
})

app.get('/YU_GI_OH/delete/:id', (req, res) => {
    let critere = req.params.id
    console.log("ID = " + critere)
    mysqlconnexion.query('DELETE FROM cartes WHERE id = ?', [critere], (err, lignes, champs) => {
        if (!err) {
            console.log("Effacement terminé")
            res.redirect("/YU_GI_OH")
        } else {
            console.log("Erreur lors de l'effacement")
            res.send("Erreur effacement : " + JSON.stringify(err))
        }
    })
})

app.get('/YU_GI_OH/update/:id', (req, res) => {
    let critere = req.params.id;
    console.log("ID à modifier = " + critere);

    // On récupère la carte pour l'injecter dans le formulaire
    mysqlconnexion.query('SELECT * FROM cartes WHERE id = ?', [critere], (err, lignes) => {
        if (!err && lignes.length > 0) {
            // On affiche une vue formulaire en lui passant les données de la carte
            res.render("formulaire", { carte: lignes[0] });
        } else {
            console.log("Erreur ou carte introuvable");
            res.redirect("/YU_GI_OH");
        }
    });
});

app.get('/YU_GI_OH', (req, res) => {
    mysqlconnexion.query('SELECT * FROM cartes', (err, lignes) => {
        if (!err) {
            console.log(lignes);
            res.render("affichage", { YU_GI_OH: lignes });
        }
    });
});

app.get('/YU_GI_OH/search/', (req, res) => {
    const critere = `%${req.query.msgSearch}%`

    console.log(`Find this : ${critere}`)
    mysqlconnexion.query('SELECT * FROM cartes WHERE nom LIKE ?', [critere], (err, lignes, champs) => {
        if (!err) {
            console.log(lignes)
            res.render("affichage", { YU_GI_OH: lignes });
        }
    })
})

app.get('/YU_GI_OH/:id', (req, res) => {
    const critere = req.params.id
    console.log(`ID = ${critere}`)
    mysqlconnexion.query('SELECT * FROM cartes WHERE id = ?', [critere], (err, lignes, champs) => {
        if (!err) {
            console.log(lignes)
            res.render("affichage", { YU_GI_OH: lignes });
        }
    })
})

app.get('/formulaire', (req, res) => {
    res.render('formulaire', { carte: null }); // On définit carte à null pour éviter l'erreur
});

app.post('/YU_GI_OH', (req, res) => {
    const { id, nom, type, attribut, niveau, atk, def, description, image } = req.body;

    if (id) {
        // Modification (Update)
        const requeteSQL = "UPDATE cartes SET nom = ?, type = ?, attribut = ?, niveau = ?, atk = ?, def = ?, description = ?, image = ? WHERE id = ?";
        const valeurs = [nom, type, attribut, niveau, atk, def, description, image, id];

        mysqlconnexion.query(requeteSQL, valeurs, (err) => {
            if (!err) {
                console.log("Modification terminée");
                res.redirect("/YU_GI_OH");
            } else {
                console.log("Erreur lors de la modification", err);
                res.send("Erreur modification : " + JSON.stringify(err));
            }
        });
    } else {
        // Insertion (Insert)
        const requeteSQL = "INSERT INTO cartes (nom, type, attribut, niveau, atk, def, description, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const valeurs = [nom, type, attribut, niveau, atk, def, description, image];

        mysqlconnexion.query(requeteSQL, valeurs, (err) => {
            if (!err) {
                console.log("Insertion terminée");
                res.redirect("/YU_GI_OH");
            } else {
                console.log("Erreur lors de l'enregistrement", err);
                res.send("Erreur ajout : " + JSON.stringify(err));
            }
        });
    }
});


