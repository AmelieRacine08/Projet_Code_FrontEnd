<template>
    <div>
        <form @submit.prevent="mettreAJour">
            <div class="mb-3">
                <label for="nom" class="form-label">Photo</label>
                <input v-model="utilisateur.photo" type="text" class="form-control" id="photo">
            </div>
            <div class="mb-3">
                <label for="nom" class="form-label">Nom</label>
                <input v-model="utilisateur.nom" type="text" class="form-control" id="nom">
            </div>
            <div class="mb-3">
                <label for="prenom" class="form-label">Prenom</label>
                <input v-model="utilisateur.prenom" type="text" class="form-control" id="prenom">
            </div>
            <div class="mb-3">
                <label for="naissance" class="form-label">Date de naissance</label>
                <input v-model="utilisateur.dateDeNaissance" type="date" class="form-control" id="naissance">
            </div>
            <div class="mb-3">
                <label for="naissance" class="form-label">Telephone</label>
                <input v-model="utilisateur.telephone" type="date" class="form-control" id="telephone">
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email</label>
                <input v-model="utilisateur.email" type="email" class="form-control" id="email">
            </div>
            <div class="mb-3">
                <label for="mdp" class="form-label">Mot de passe</label>
                <input v-model="utilisateur.motDePasse" type="password" class="form-control" id="mdp">
            </div>
            <button type="submit" class="btn btn-primary">Mettre a jour</button>
        </form>
    </div>
</template>

<script setup>
import { ref, reactive, onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const route = useRoute()
const { id } = route.params

const router = useRouter()
const utilisateur = ref({})

import useUtilisateur from '../../services/serviceUtilisateur';
const { getUtiliateurById, updateUtilisateur } = useUtilisateur()

onBeforeMount(() => {
    if (id) getUtiliateurById(id).then(data => {
        utilisateur.value = data
    }).catch(err => console.log('erreur mise a jour', err))
})

const mettreAJour = () => {
    updateUtilisateur(id, utilisateur.value).then(() => {
        router.push('/')
    }).catch(err => console.log('Probleme lors de la mise a jour', err))
}
</script>

<style lang="scss" scoped></style>