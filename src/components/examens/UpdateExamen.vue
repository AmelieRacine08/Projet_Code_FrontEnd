<template>
    <div class="form">
        <form @submit.prevent="mettreAJour">
            <div class="mb-3">
                <label for="matiere" class="form-label">Matière</label>
                <input v-model="examen.matiere" type="text" class="form-control" id="matiere">
            </div>
            <div class="mb-3">
                <label for="date_examen" class="form-label">Date de l'examen</label>
                <input v-model="examen.date_examen" type="date" class="form-control" id="date_examen">
            </div>
            <div class="mb-3">
                <label for="horaire_de_debut" class="form-label">Horaire de début</label>
                <input v-model="examen.horaire_de_debut" type="time" class="form-control" id="horaire_de_debut">
            </div>

            <div class="mb-3">
                <label for="horaire_de_fin" class="form-label">Horaire de fin</label>
                <input v-model="examen.horaire_de_fin" type="time" class="form-control" id="horaire_de_fin">
            </div>
            <div class="mb-3">
                <label for="salle_examen" class="form-label">Salle d'examen</label>
                <input v-model="examen.salle_examen" type="text" class="form-control" id="salle_examen">
            </div>
            <button type="submit" class="btn btn-primary">Mettre a jour</button>

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
import useExamen from '../../services/serviceExamen';

const route = useRoute()
const { id } = route.params
const router = useRouter()
const examen = ref({})
const utilisateur = ref({});
const isAdmin = ref(true);
const peuxAccederProfil = ref(true);


const { getExamenById, updateExamen } = useExamen()

onBeforeMount(() => {
    if (id) getExamenById(id).then(data => {
        examen.value = data
    }).catch(err => console.log("Erreur de recherche de l'examen", err))
})

const mettreAJour = () => {
    isAdmin.value = utilisateur.value.role === 'administration';
    peuxAccederProfil.value = isAdmin.value;

    updateExamen(id, examen.value).then(() => {
        router.push('/')
        examen.value.matiere = '';
        examen.value.date_examen = '';
        examen.value.horaire_de_debut = '';
        examen.value.horaire_de_fin = '';
        examen.value.salle_examen = '';
        console.log("Examen mis à jour avec succès!");
    }).catch(err => console.log("Probleme lors de la mise a jour de l'examen", err))
}
</script>

<style lang="scss" scoped>
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