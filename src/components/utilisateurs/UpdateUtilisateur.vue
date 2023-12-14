<template>
    <div class="form">
        <form @submit.prevent="mettreAJour">
            <div class="mb-3">
                <label for="photo" class="form-label">Photo</label>
                <input @change="handleFileChange" type="file" class="form-control" id="photo">
            </div>
            <div class="mb-3">
                <label for="nom" class="form-label">Nom</label>
                <input :style="{ border: errors.nom ? '2px red solid' : '' }" v-model="utilisateur.nom" type="text"
                    class="form-control" id="nom">
                <div class="text-danger pb-2" v-if="errors.nom">{{ errors.nom }}</div>
            </div>
            <div class="mb-3">
                <label for="prenom" class="form-label">Prenom</label>
                <input :style="{ border: errors.prenom ? '2px red solid' : '' }" v-model="utilisateur.prenom" type="text"
                    class="form-control" id="prenom">
                <div class="text-danger pb-2" v-if="errors.prenom">{{ errors.prenom }}</div>
            </div>
            <div class="mb-3">
                <label for="naissance" class="form-label">Date de naissance</label>
                <input :style="{ border: errors.dateNaissance ? '2px red solid' : '' }" v-model="utilisateur.dateNaissance"
                    @input="validerDateNaissance" type="date" class="form-control" id="naissance" />
                <div class="text-danger pb-2" v-if="errors.dateNaissance">{{ errors.dateNaissance }}</div>
            </div>
            <div class="mb-3">
                <label for="telephone" class="form-label">Telephone</label>
                <input :style="{ border: errors.numeroTelephone ? '2px red solid' : '' }" v-model="utilisateur.numeroTelephone"
                    @input="validerTelephone" type="tel" class="form-control" id="telephone">
                <div class="text-danger pb-2" v-if="errors.numeroTelephone">{{ errors.numeroTelephone }}</div>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input :style="{ border: errors.email ? '2px red solid' : '' }" v-model="utilisateur.email" type="email"
                    class="form-control" id="email">
                <div class="text-danger pb-2" v-if="errors.email">{{ errors.email }}</div>
            </div>
            <div class="mb-3">
                <label for="mdp" class="form-label">Mot de passe</label>
                <input :style="{ border: errors.motPasse ? '2px red solid' : '' }" v-model="utilisateur.motPasse"
                    type="password" class="form-control" id="mdp">
                <div class="text-danger pb-2" v-if="errors.motPasse">{{ errors.motPasse }}</div>
            </div>            
            <button type="submit" class="btn btn-primary" @click="mettreAJour">Modifier</button>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, watchEffect } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const { id } = route.params

const router = useRouter()
const utilisateur = ref({})


// Variable pour stocker les erreurs de validations des champs
const errors = ref({
    nom: '',
    prenom: '',
    dateNaissance: '',
    numeroTelephone:'',
    email: '',
    motPasse: ''
})

import useUtilisateur from '../../services/serviceUtilisateur';
const { getUtilisateurById, updateUtilisateur } = useUtilisateur()

onBeforeMount(() => {
    if (id) getUtilisateurById(id).then(data => {
        utilisateur.value = data
    }).catch(err => console.log("Erreur de recherche de l'utilisateur", err))
})

const mettreAJour = () => {

    if (!valider(utilisateur.value)) return


    //Ne pas soumettre le formulaire si tous les champs ne sont pas valides
    if(!valider(utilisateur.value)) return
    updateUtilisateur(id, utilisateur.value).then(() => {
        router.push('/')
    }).catch(err => {
        console.log("Probleme lors de la mise a jour de l'utilisateur", err)

        //En cas d'erreurs au backend, recuperer les erreurs provenant du backend et les afficher sur le formulaire
        const backendErrors = err.response.data.errors
        //Creer un objet pour mettre les erreurs du backend dans le meme format que la variable errors (declares plus haut)
        const backendError = {}

        if (Array.isArray(backendErrors)) {
            for (let error of backendErrors) {
                backendError[error.path] = error.msg;
            }
        } else {
            
            console.error("Backend errors format is not as expected:", backendErrors);
        }
        // Copier les erreurs du backend mises en forme dans la variable errors
        errors.value = { ...errors.value, ...backendError }
    })
}

//Regex utilisees dans la validation-- on peut aussi utiliser des simples if else
const mdpRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const nomRegex = /^[a-zA-Z]{4,}$/
const telephoneRegex = /^[0-9]{10}$/;

const validerDateNaissance = () => {
    if (utilisateur.dateNaissance) {
        const dateParties = utilisateur.dateNaissance.split('-');
        const formatDate = `${dateParties[1]}/${dateParties[2]}/${dateParties[0]}`;


        const regexDate = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regexDate.test(formatDate) || isNaN(new Date(formatDate))) {
            errors.dateNaissance = 'Date de naissance invalide';
        } else {
            errors.dateNaissance = '';
        }
    } else {
        errors.dateNaissance = "Date de naissance manquante";
    }
};

//Fonction pour verifier que tout le formulaire est valide
const valider = utilisateur => {

    //Validation de chaque champ pour afficher le bon message en cas d'erreur
    for (let champ in utilisateur) {
        validerChamp(champ, utilisateur)
    }

    if (!mdpRegex.test(utilisateur.motPasse) || !emailRegex.test(utilisateur.email) || !nomRegex.test(utilisateur.nom) || !nomRegex.test(utilisateur.prenom) || !telephoneRegex.test(utilisateur.numeroTelephone)) {
        return false
    }
    return true
}
//Fonction utiliser pour valider un champ donne
const validerChamp = (champ, utilisateur) => {
    switch (champ) {
        case 'nom':
        case 'prenom':
            if (!nomRegex.test(utilisateur[champ])) {
                errors.value[champ] = `${champ} est invalide !`
            }
            break
        case 'motPasse':
            if (!mdpRegex.test(utilisateur[champ])) {
                errors.value[champ] = `Le mot de passe est invalide !`
            }
            break
        case 'numeroTelephone':
            if (!telephoneRegex.test(utilisateur[champ])) {
                errors.value[champ] = "Le numéro de téléphone est invalide !"
            }
            break
        case 'email':
            if (!emailRegex.test(utilisateur[champ])) {
                errors.value[champ] = `L'email est invalide !`
            }
            break
        case 'dateNaissance':
            if (!isNaN(new Date(utilisateur[champ]))) {
                errors.value[champ] = `Date de naissance est invalide !`
            }

    }


}

// Voir les erreurs de validation en temps reel
watchEffect(() => {
    errors.value.nom = '';
    if (utilisateur.value.nom !== '' && !nomRegex.test(utilisateur.value.nom)) {
        errors.value.nom = "Le nom doit être d'une taille minimum de 4 lettres";
        return;
    }
    errors.value.prenom = '';
    if (utilisateur.value.prenom !== '' && !nomRegex.test(utilisateur.value.prenom)) {
        errors.value.prenom = "Le prénom doit être d'une taille minimum de 4 lettres";
        return;
    }
    errors.value.numeroTelephone = '';
    if(utilisateur.value.numeroTelephone !== '' && !telephoneRegex.test(utilisateur.value.numeroTelephone)){
        errors.value.numeroTelephone = "Le numéro de téléphone doit être d'une longueur de 10 chiffres"
        return
    }   
    errors.value.motPasse = '';
    if (utilisateur.value.motPasse !== '' && !mdpRegex.test(utilisateur.value.motPasse)) {
        errors.value.motPasse = "Le mot de passe doit contenir une majuscule, une minuscule, un chiffre et un caractère spécial";
        return;
    }
    errors.value.email = '';
    if (utilisateur.value.email !== '' && !emailRegex.test(utilisateur.value.email)) {
        errors.value.email = "L'email doit contenir un @ et un .adresse";
        return;
    }
    validerDateNaissance();
});
</script>

<style lang="scss" scoped>
</style>