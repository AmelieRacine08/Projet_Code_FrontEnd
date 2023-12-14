<template>
    <div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prenom</th>
            <th>Telephone</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <Utilisateur
            v-for="user in utilisateurs.Utilisateurs"
            :key="user.id"
            :utilisateur="user"
            @supprimer="supprimer"
          />
        </tbody>
      </table>
      <button class="btn btn-primary" @click="allerAJouterUtilisateur">
        Ajouter un utilisateur
      </button>
    </div>
  </template>

<script setup>
import { ref, reactive, onBeforeMount, defineProps } from 'vue';
import useUtilisateur from '../../services/serviceUtilisateur.js';
import { useRouter } from 'vue-router';
import useAuthStore from '../../stores/auth';
import Utilisateur from './Utilisateur.vue';
import { storeToRefs } from 'pinia';

const utilisateurs = ref({ Utilisateurs: [] })
const store = useAuthStore()
const { loggedInUser } = storeToRefs(store)
const router = useRouter()
const { listeUtilisateurs, supprimerUtilisateur } = useUtilisateur()

onBeforeMount(() => {

    listeUtilisateurs().then(data => {

        utilisateurs.value = data

        console.log('Liste utilisateur', data)
    })
})


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

const allerAJouterUtilisateur = () => {
    router.push('/utilisateurs/ajout')
}
</script>

<style scoped>
  
  .table {
    width: 100%;
    margin-bottom: 1rem;
    color: #212529;
  }

  .table th,
  .table td {
    padding: 0.75rem;
    vertical-align: top;
    border-top: 1px solid #dee2e6;
  }

  .table thead th {
    vertical-align: bottom;
    border-bottom: 2px solid #dee2e6;
  }

  .table tbody + tbody {
    border-top: 2px solid #dee2e6;
  }

  /* Button Styles */
  .btn-primary {
    background-color: #007bff;
    border-color: #007bff;
  }

  .btn-primary:hover {
    background-color: #0056b3;
    border-color: #0056b3;
  }

  /* Additional Styles for Action Column */
  .action-column {
    text-align: center;
  }  
</style>
