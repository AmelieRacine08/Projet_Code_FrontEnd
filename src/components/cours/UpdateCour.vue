<template>
    <div class="form">
        <form @submit.prevent="mettreAJour">
            <div class="mb-3">
                <label for="nom_du_cours" class="form-label">Nom du cours</label>
                <input :style="{ border: error.nom_du_cours ? '2px solid red' : '', outline: 'none' }"
                    v-model="cour.nom_du_cours" type="text" class="form-control" id="nom_du_cours" required>
                <div v-if="error.nom_du_cours" class="error-message">{{ error.nom_du_cours }}</div>
            </div>
            <div class="mb-3">
                <label for="salle_du_cours" class="form-label">Salle de cours</label>
                <input :style="{ border: error.salle_du_cours ? '2px solid red' : '', outline: 'none' }"
                    v-model="cour.salle_du_cours" type="text" class="form-control" id="salle_du_cours" required>
                <div v-if="error.salle_du_cours" class="error-message">{{ error.salle_du_cours }}</div>
            </div>
            <div class="mb-3">
                <label for="credits" class="form-label">Crédits</label>
                <input :style="{ border: error.credits ? '2px solid red' : '', outline: 'none' }" v-model="cour.credits"
                    type="text" class="form-control" id="credits" required>
                <div v-if="error.credits" class="error-message">{{ error.credits }}</div>
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
import useCour from '../../services/serviceCour';

const route = useRoute()
const { id } = route.params
const router = useRouter()
const { getCourById, updateCour } = useCour()
const isAdmin = ref(true);
const peuxAccederProfil = ref(true);

const cour = ref({
    nom_du_cours: '',
    salle_du_cours: '',
    credits: ''
});

// Variable pour stocker les erreurs de validations des champs
const error = ref({
    nom_du_cours: '',
    salle_du_cours: '',
    credits: ''
});

const nomDuCourRegex = /^[a-zA-Z\s]+$/;
const salleDuCourRegex = /^[a-zA-Z0-9\s]+$/;
const creditsRegex = /^(?:100|[1-9]?[0-9])$/;

const valider = cour => {

    //Validation de chaque champ pour afficher le bon message en cas d'erreur
    for (let champ in cour) {
        validerChamp(champ, cour);
    }

    if (!creditsRegex.test(cour.credits) || !nomDuCourRegex.test(cour.nom_du_cours) || !salleDuCourRegex.test(cour.salle_du_cours)) {
        return false;
    }
    return true;
};

// Fonction pour valider un champ donné
const validerChamp = (champ, cour) => {
    switch (champ) {
        case 'nom_du_cours':
            if (!nomDuCourRegex.test(cour[champ])) {
                error[champ] = `Le champ ${champ} ne doit pas être vide et doit contenir uniquement des lettres.`;
            }
            break;
        case 'salle_du_cours':
            if (!salleDuCourRegex.test(cour[champ])) {
                error[champ] = `Le champ ${champ} ne doit pas être vide et doit contenir uniquement des lettres et des chiffres.`;
            }
            break;
        case 'credits':
            if (!creditsRegex.test(cour[champ])) {
                error[champ] = `Le champ ${champ} doit être un nombre entier entre 0 et 100.`;
            }
            break;
    }
};

// Voir les erreurs de validation en temps réel
watchEffect(() => {
    error.value.nom_du_cours = '';
    if (cour.value.nom_du_cours !== '' && !nomDuCourRegex.test(cour.value.nom_du_cours)) {
        error.value.nom_du_cours = "Le nom du cour doit contenir uniquement des lettres.";
        return;
    }
    error.value.salle_du_cours = '';
    if (cour.value.salle_du_cours !== '' && !salleDuCourRegex.test(cour.value.salle_du_cours)) {
        error.value.prenom = "La salle de cour doit contenir uniquement des lettres et des chiffres.";
        return;
    }
    error.value.credits = '';
    if (cour.value.credits !== '' && !creditsRegex.test(cour.value.credits)) {
        error.value.credits = "Les crédits doit être un nombre entier entre 0 et 100."
        return
    }
});

onBeforeMount(() => {
    if (id) getCourById(id).then(data => {
        cour.value = data
    }).catch(err => console.log('Erreur avec la recherche du cours', err))
})

const mettreAJour = () => {

    isAdmin.value = utilisateur.value.role === 'administration';
    peuxAccederProfil.value = isAdmin.value;

    if (!valider(cour.value)) return;

    updateCour(id, cour.value).then(() => {

        router.push('/')

    }).catch(err => {
        console.log('Probleme lors de la mise a jour du cours', err)

        //En cas d'erreurs au backend, recuperer les erreurs provenant du backend et les afficher sur le formulaire
        const backendErrors = err.response.data.errors
        //Creer un objet pour mettre les erreurs du backend dans le meme format que la variable errors (declares plus haut)
        const backendError = {}

        if (Array.isArray(backendErrors)) {
            for (let error of backendErrors) {
                backendError[error.path] = error.msg;
            }
        } else {

            console.error("Le format des erreurs du backend n'est pas conforme aux attentes:", backendErrors);
        }
        // Copier les erreurs du backend mises en forme dans la variable errors
        error.value = { ...error.value, ...backendError }

    })
}
</script>

<style scoped>
.error-message {
    color: red;
    margin-top: 0.5vw;
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

#non-connecte-message-box {
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