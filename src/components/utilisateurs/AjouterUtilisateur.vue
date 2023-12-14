<template>
    <div class="form">
        <form @submit.prevent="soumettre">
            <div class="mb-3">
                <label for="photo" class="form-label">Photo</label>
                <input @change="handleFileChange" type="file" class="form-control" id="photo" style="width: 40vw;">
            </div>
            <div class="mb-3">
                <label for="nom" class="form-label">Nom</label>
                <input :style="{ border: errors.nom ? '2px red solid' : '' }" v-model="utilisateur.nom" type="text"
                    class="form-control" id="nom" style="width: 40vw;">
                <div class="text-danger pb-2" v-if="errors.nom">{{ errors.nom }}</div>
            </div>
            <div class="mb-3">
                <label for="prenom" class="form-label">Prenom</label>
                <input :style="{ border: errors.prenom ? '2px red solid' : '' }" v-model="utilisateur.prenom" type="text"
                    class="form-control" id="prenom" style="width: 40vw;">
                <div class="text-danger pb-2" v-if="errors.prenom">{{ errors.prenom }}</div>
            </div>
            <div class="mb-3">
                <label for="naissance" class="form-label">Date de naissance</label>
                <input :style="{ border: errors.dateNaissance ? '2px red solid' : '' }" v-model="utilisateur.dateNaissance"
                    @input="validerDateNaissance" type="date" class="form-control" id="naissance" style="width: 40vw;" />
                <div class="text-danger pb-2" v-if="errors.dateNaissance && dateNaissanceValid">
                    {{ errors.dateNaissance }}
                </div>
            </div>
                <div class="mb-3">
                    <label for="telephone" class="form-label">Telephone</label>
                    <input :style="{ border: errors.numeroTelephone ? '2px red solid' : '' }"
                        v-model="utilisateur.numeroTelephone" @input="validerTelephone" type="tel" class="form-control"
                        id="telephone" style="width: 40vw;">
                    <div class="text-danger pb-2" v-if="errors.numeroTelephone">{{ errors.numeroTelephone }}</div>
                </div>
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input :style="{ border: errors.email ? '2px red solid' : '' }" v-model="utilisateur.email" type="email"
                        class="form-control" id="email" style="width: 40vw;">
                    <div class="text-danger pb-2" v-if="errors.email">{{ errors.email }}</div>
                </div>
                <div class="mb-3">
                    <label for="mdp" class="form-label">Mot de passe</label>
                    <input :style="{ border: errors.motPasse ? '2px red solid' : '' }" v-model="utilisateur.motPasse"
                        type="password" class="form-control" id="mdp" style="width: 40vw;">
                    <div class="text-danger pb-2" v-if="errors.motPasse">{{ errors.motPasse }}</div>
                </div>

                <button type="submit" class="btn btn-primary" @click="soumettre">Ajouter</button>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, watchEffect, onBeforeMount } from 'vue';
import { useRouter } from 'vue-router';
import useUtilisateur from '../../services/serviceUtilisateur';
import axios from 'axios';

const dateNaissanceValid = ref(true);
const router = useRouter()
const { ajouterUtilisateur } = useUtilisateur()

const utilisateur = ref({
    photo: '',
    nom: '',
    prenom: '',
    dateNaissance: '',
    numeroTelephone: '',
    email: '',
    motPasse: ''
})

// Variable pour stocker les erreurs de validations des champs
const errors = ref({
    nom: '',
    prenom: '',
    dateNaissance: '',
    numeroTelephone: '',
    email: '',
    motPasse: ''
})

const soumettre = () => {

    console.log('utilisateur', utilisateur)

    //Ne pas soumettre le formulaire si tous les champs ne sont pas valides
    if (!valider(utilisateur.value, { excludeProgramme: true }) || !dateNaissanceValid.value) return;

    ajouterUtilisateur(utilisateur.value).then(() => {
        utilisateur.value = {
            photo: '',
            nom: '',
            prenom: '',
            dateNaissance: '',
            numeroTelephone: '',
            email: '',
            motPasse: '',
        };

        router.push('/utilisateurs')
    }).catch(err => {
        console.log("Probleme lors de l'ajout de l'utilisateur", err)

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
        errors.value = { ...errors.value, ...backendError }

    })
}

const handleFileChange = (event) => {
    const file = event.target.files[0];
    utilisateur.photo = URL.createObjectURL(file);
};


//Regex utilisees dans la validation-- on peut aussi utiliser des simples if else
const mdpRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
const nomRegex = /^[a-zA-ZÀ-ÖØ-öø-ÿ\s]{4,}$/;
const telephoneRegex = /^[0-9]{10}$/;


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
            break
        case 'role':
            if (!utilisateur.role) {
                errors.value.role = 'Le champ "Role" est obligatoire';
                return false;
            } else if (!rolesFromDatabase.value.some(role => role.id === utilisateur.role)) {
                errors.value.role = 'Le rôle sélectionné n\'est pas valide';
                return false;
            } else {
                errors.value.role = ''; // Réinitialiser l'erreur si le champ est valide
                return true;
            }
    }
};


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
    if (utilisateur.value.numeroTelephone !== '' && !telephoneRegex.test(utilisateur.value.numeroTelephone)) {
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
});



// Fonction pour charger les rôles depuis la base de données
/*const chargerRoles = async () => {
    try {
        const roles = await listeRoles();
         rolesFromDatabase.value = roles;
         console.log('Roles fetched:', roles);
    } catch (error) {
        console.error('Erreur lors du chargement des rôles', error);
    }
};

// Fonction pour charger les programmes depuis la base de données
const chargerProgrammes = async () => {
    try {
        const programmes = await listeProgrammes();
        programmesFromDatabase.value = programmes
        console.log('Programmes fetched:', programmes);

    } catch (error) {
        console.error('Erreur lors du chargement des programmes', error);
    }
};*/
/*onBeforeMount(async()=>{
    await chargerRoles();
    await chargerProgrammes();

})*/

// Charger les données au moment du montage du composant
/*onMounted(async () => {
    
});*/

</script>

<style lang="scss" scoped></style>