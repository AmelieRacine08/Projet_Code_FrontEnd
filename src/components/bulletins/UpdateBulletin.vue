<template>
    <div class="form">
        <form @submit.prevent="mettreAJour">
            <div class="mb-3">
                <label for="moyenne" class="form-label" id="label-moyenne">Moyenne</label>
                <input :style="{ border: error.moyenne ? '2px solid red' : '', outline: 'none' }" type="text"
                    class="form-control" v-model="bulletin.moyenne" id="moyenneInput" required>
                <div v-if="error.moyenne" class="error-message">{{ error.moyenne }}</div>
            </div>
            <button type="submit" class="btn btn-primary">Mettre a jour</button>
            <div v-if="!estConnecte" id="non-connecte-message-container">
                <div id="non-connecte-message-box">
                    <p>Vous n'êtes pas connecté</p>
                </div>
            </div>

            <div v-if="!peuxAccederProfil" id="non-admin-message-container">
                <div id="non-admin-message-box">
                    <p>Vous n'êtes pas administrateur donc vous n'avez pas accès à la création d'un bulletin.</p>
                </div>
            </div>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useBulletin from '../../services/serviceBulletin';

const route = useRoute()
const { id } = route.params
const router = useRouter()
const bulletin = ref({})
const isAdmin = ref(true);
const peuxAccederProfil = ref(true);

const { getBulletinById, updateBulletin } = useBulletin()

// Variable pour stocker les erreurs de validations des champs
const error = ref({
    moyenne: ''
})

const moyenneRegex = /^\d{1,3}(\.\d{0,2})?$/;

//Fonction pour verifier que tout le formulaire est valide
const valider = bulletin => {

    //Validation de chaque champ pour afficher le bon message en cas d'erreur
    for (let champ in bulletin) {
        validerChamp(champ, bulletin)
    }

    if (bulletin.moyenne !== '' && !moyenneRegex.test(bulletin.moyenne)) {
        return false;
    }
    return true;
};

//Fonction utiliser pour valider un champ donne
const validerChamp = (champ, bulletin) => {
  
    switch (champ) {
        case 'moyenne':
            if (bulletin[champ] !== '' && !moyenneRegex.test(bulletin[champ])) {
                error.value[champ] = 'La moyenne est un nombre décimal avec maximum 3 chiffres avant le point et de 2 chiffres après le point.';
            } else {
                error.value[champ] = '';
            }
            break;
    }
};

// Voir les erreurs de validation en temps reel
watchEffect(() => {
    validerChamp('moyenne', bulletin.value);
});


onBeforeMount(() => {
    if (id) getBulletinById(id).then(data => {
        bulletin.value = data
    }).catch(err => console.log('erreur mise a jour', err))
})

const mettreAJour = () => {
    isAdmin.value = utilisateur.value.role === 'administration';
    peuxAccederProfil.value = isAdmin.value;

    if (!id.value) {
        console.error('Veuillez spécifier l\'ID du bulletin.');
        return;
    }

    isAdmin.value = utilisateur.value.role === 'administration';
    peuxAccederProfil.value = isAdmin.value;

    //Ne pas soumettre le formulaire si tous les champs ne sont pas valides
    if (!valider(bulletin.value)) return

    updateBulletin(id, bulletin.value).then(() => {

        router.push('/')
        bulletin.value.moyenne = '';
        console.log("Bulletin mis à jour avec succès!");
    }).catch(err => {
        console.log('Probleme lors de la mise a jour du bulletin', err)

        //En cas d'erreurs au backend, recuperer les erreurs provenant du backend et les afficher sur le formulaire
        const backendErrors = err.response.data.errors
        //Creer un objet pour mettre les erreurs du backend dans le meme format que la variable errors (declares plus haut)
        const backendError = {}

        if (Array.isArray(backendErrors)) {
            for (let error of backendErrors) {
                backendError[error.path] = error.msg;
            }
        } else {

            console.error("Le format des erreurs du backend n'est pas celui attendu :", backendErrors);
        }
        // Copier les erreurs du backend mises en forme dans la variable errors
        error.value = { ...error.value, ...backendError }

    })
}
</script>

<style scoped>
.form-container {
    height: 17vw;
    margin-left: 10vw;
}

#label-moyenne {
    width: 40vw;
    margin-top: 2vw;
}

.error-message {
  color: red;
  margin-top: 0.5vw;
}

#moyenneInput {
    width:  40vw;
    box-sizing: border-box;
}

#non-admin-message-container {
    margin-top: 1em;
    margin-left: 10em;
    margin-right: 10em;
}

#non-admin-message-box {
    background-color: white;
    padding: 1em;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

#non-admin-message-box p {
    margin: 0;
    color: red; 
}
#non-connecte-message-container {
    margin-top: 1em;
    margin-right: 10em;
}

#non-connecte-message-box{
    background-color: white;
    padding: 1em;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
#non-connecte-message-box p {
    margin: 0;
    color: red; 
}

</style>