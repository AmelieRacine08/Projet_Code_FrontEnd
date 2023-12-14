<template>
    <div class="form">
        <form @submit.prevent="mettreAJour" id="role-form">
            <div class="mb-3">
                <label for="categorie" class="form-label" id="label-categorie">Categorie</label>
                <input v-model="role.categorie" type="text" class="form-control" id="categorie" required>
            </div>

            <button type="submit" class="btn btn-primary" id="role-submit-btn">Mettre à jour</button>

            <div v-if="!estConnecte" id="non-connecte-message-container">
                <div id="non-connecte-message-box">
                    <p>Vous n'êtes pas connecté</p>
                </div>
            </div>
            
            <div v-if="!peuxAccederProfil" id="non-admin-message-container">
                <div id="non-admin-message-box">
                    <p>Vous n'êtes pas administrateur donc vous n'avez pas accès à la création d'un role.</p>
                </div>
            </div>
        </form>
    </div>
</template>



<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import useRole from '../../services/serviceRole';

const route = useRoute()
const { id } = route.params
const router = useRouter()
const role = ref({})
const utilisateur = ref({});
const isAdmin = ref(true);
const peuxAccederProfil = ref(true);


const { getRoleById, updateRole } = useRole()

onBeforeMount(() => {
    if (id) getRoleById(id).then(data => {
        role.value = data
    }).catch(err => console.log("Erreur de recherche de role", err))
})

const mettreAJour = () => {

    isAdmin.value = utilisateur.value.role === 'administration';
    peuxAccederProfil.value = isAdmin.value;

    updateRole(id, role.value).then(() => {
        router.push('/')
        role.value.categorie = '';
    }).catch(err => console.log("Probleme lors de la mise a jour du role", err))
}
</script>




<style scoped>


#categorie {
    width: 40vw;
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