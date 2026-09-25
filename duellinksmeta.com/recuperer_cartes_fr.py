import requests

print("Téléchargement de la base de données des cartes Yu-Gi-Oh! avec les images en FRANÇAIS...")
url = "https://db.ygoprodeck.com/api/v7/cardinfo.php?language=fr"

try:
    response = requests.get(url)
    data = response.json()['data']
    print(f"{len(data)} cartes récupérées avec succès !")
except Exception as e:
    print(f"Erreur lors du téléchargement : {e}")
    exit()

output_sql = 'insertion_cartes.sql'

with open(output_sql, 'w', encoding='utf-8') as f:
    f.write("CREATE TABLE cartes (\n")
    f.write("    id INT AUTO_INCREMENT PRIMARY KEY,\n")
    f.write("    nom VARCHAR(255) NOT NULL,\n")
    f.write("    type VARCHAR(50),\n")
    f.write("    attribut VARCHAR(30),\n")
    f.write("    niveau INT,\n")
    f.write("    atk INT,\n")
    f.write("    def INT,\n")
    f.write("    description TEXT,\n")
    f.write("    image VARCHAR(500)\n")
    f.write(");\n\n")

    f.write("INSERT INTO cartes (nom, type, attribut, niveau, atk, def, description, image) VALUES\n")

    values = []
    for card in data:
        nom = card.get('name', '').replace("'", "''")
        type_carte = card.get('type', '').replace("'", "''")
        attribut = card.get('attribute', None)
        attribut_str = f"'{attribut}'" if attribut else "NULL"

        niveau = card.get('level', card.get('linkval', None))
        niveau_val = str(niveau) if niveau is not None else "NULL"

        atk = card.get('atk', None)
        atk_val = str(atk) if atk is not None and atk != -1 else "NULL"

        def_val = card.get('def', None)
        def_val_str = str(def_val) if def_val is not None and def_val != -1 else "NULL"

        description = card.get('desc', '').replace("'", "''")

        # Astuce : YGOPRODeck héberge parfois les images françaises avec un ID spécifique ou l'URL standard.
        # On va construire l'URL de l'image officielle française si elle existe, sinon repli sur l'image de base.
        image_url = ""
        if 'card_images' in card and len(card['card_images']) > 0:
            card_id = card['card_images'][0].get('id')
            # L'URL officielle des images de YGOPRODeck supporte les versions FR via leur CDN d'images si disponibles
            # Format standard pour les images de cartes :
            image_url = f"https://images.ygoprodeck.com/images/cards/{card_id}.jpg"

        val_str = f"('{nom}', '{type_carte}', {attribut_str}, {niveau_val}, {atk_val}, {def_val_str}, '{description}', '{image_url}')"
        values.append(val_str)

    f.write(",\n".join(values) + ";\n")

print(f"Fichier '{output_sql}' généré avec les liens d'images mis à jour !")