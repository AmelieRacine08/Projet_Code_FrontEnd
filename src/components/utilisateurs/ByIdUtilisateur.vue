<template>
    <div class="user-profile-box">
        <!-- Affichage du profil -->
        <div v-if="utilisateur" class="profile-container">
            <div class="profile-header">
                <!-- Profil Photo -->
                <img v-if="utilisateur.photo" :src="utilisateur.photo" alt="Profile Photo" class="profile-photo" />
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="80" height="80" fill="currentColor"
                    class="bi bi-person-circle" viewBox="0 0 16 16">
                    <path d="M11 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0" />
                    <path fill-rule="evenodd"
                        d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m8-7a7 7 0 0 0-5.468 11.37C3.242 11.226 4.805 10 8 10s4.757 1.225 5.468 2.37A7 7 0 0 0 8 1" />
                </svg>

                <!-- Profil Information -->
                <div class="profile-info">
                    <!-- Message d'erreur pour utilisateur non connecté -->
                    <div>
                        <p></p>
                    </div>
                    <div v-if="!peuxAccederProfil">
                        <p>Vous n'avez pas le droit de voir ce profil.</p>
                    </div>
                    <div v-else id="contenant-info-profil">
                        <h1>Profil de {{ utilisateur.nom }} {{ utilisateur.prenom }}</h1>
                        <p>Biographie</p>
                        <div>Email: {{ utilisateur.email }}</div>
                        <div>Telephone: {{ utilisateur.numeroTelephone }}</div>
                        <div>Date de naissance: {{ utilisateur.dateNaissance }}</div>
                    </div>
                </div>
            </div>

            <!-- Profil Buttons -->
            <div class="profile-buttons">
                <button class="btn btn-primary" @click="allerUpdateUtilisateur">Modifier</button>
                <button class="btn btn-primary" @click="supprimer">Supprimer</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount, computed } from 'vue';

// Recuperer les variable de chemin
import { useRoute } from 'vue-router';

// Fonction/Service qui permet de recuperer un utilisateur depuis la base de donnees
import useUtilisateur from '../../services/serviceUtilisateur';
//Importer le module qui permet la reidrection vers une autre page
import { useRouter } from 'vue-router';


const router = useRouter()
const route = useRoute()
const { id } = route.params
const utilisateur = ref({})
const isAdmin = ref(true);
const peuxAccederProfil = ref(true);
const userId = ref('');

const props = defineProps({
    utilisateur: {
        type: Object,
        default: () => ({
            id: '',
            photo:'',
            nom: 'test',
            prenom: 'test',
            dateNaissance: 'test',
            numeroTelephone: 'test',
            email: 'test',            
        })
    }
})

const { getUtilisateurById } = useUtilisateur()

const rechercherProfil = async () => {
    /* if (!estAuthentifier()) {
         return
     }*/

    try {
        const data = await getUtilisateurById(userId.value ? userId.value : id);

        utilisateur.value = data;
        console.log("Voici l'utilisateur", data)
        console.log("ID", id)
        isAdmin.value = utilisateur.value?.Role.categorie.toLowerCase() === 'administration';
        peuxAccederProfil.value = isAdmin.value;
        console.log("Acces : ", peuxAccederProfil.value)
    } catch (err) {
        console.error('Erreur pendant la recherche du profil', err);
    }
};

const allerUpdateUtilisateur = async () => {
    router.push(`/utilisateurs/mise-a-jour/:${props.utilisateur.id}`)

}

const supprimer = (id) => {

    console.log('emits', id)

    supprimerUtilisateur(id).then((data) => {

        console.log('suppression', data)

        listeUtilisateurs().then(data => {

            utilisateurs.value = data

            console.log('Liste utilisateur', data)

        }).catch(err => {
            console.log(err.message)
        })

    }).catch((error) => {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
    });

}

onBeforeMount(async () => {
    if (id) {
        await rechercherProfil();
    }
});

//const utilisateurEstConnecter = computed(() => estAuthentifier());

</script>


<style scoped>
.user-profile-box {
    background-color: #fff;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-left: 25%;
    width: max-content;
}

.profile-container {
    margin: 2vw;
}

.profile-header {
    display: flex;
    align-items: center;
}

.profile-photo {
    width: 80px;
    height: 80px;
    margin-right: 20px;
    margin-left: 10px;
    border-radius: 50%;
}

.profile-info {
    flex: 1;
}

.profile-buttons {
    display: flex;
    margin-top: 1vw;
    margin-left: 8em;
}

.btn {
    margin-right: 2vw;
    margin-left: 2vw;
    margin-top: 1vw;
}

#contenant-info-profil {
    margin-left: 5em;
}
</style>