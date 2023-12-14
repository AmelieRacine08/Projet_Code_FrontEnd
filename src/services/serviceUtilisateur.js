// Importer axios
//import axios from 'axios'

import frontAPI from "./axiosAPI"

// Creation des composables

const useUtilisateur = () => {

    const listeUtilisateurs = async () => {
        try {
            const resultat = await frontAPI.get(`/utilisateurs`)
            const utilisateurs = resultat.data;
            console.log('Liste des cours:', utilisateurs);
            return utilisateurs;
        } catch (error) {
            console.error('Erreur lors de la récupération des cours:', error);
            throw error;
        }



    }

    const ajouterUtilisateur = async (utilisateur) => {
        const resultat = await frontAPI.post(`/utilisateurs`, utilisateur)
       
        return resultat.data.data
        
    }

    const getUtilisateurById = async (id) => {
        const resultat = await frontAPI.get(`/utilisateurs/${id}`)
        console.log("Resultat", resultat.data.Utilisateur)
        
        return resultat.data.Utilisateur
    }

    const supprimerUtilisateur = async (id) => {

        const resultat = await frontAPI.delete(`/utilisateurs/${id}`)

        return resultat.data.data
    }

    const updateUtilisateur = async (id, utilisateur) => {
        const resultat = await frontAPI.put(`/utilisateurs/${id}`, utilisateur)
        return resultat.data.data

    }

    return { listeUtilisateurs, ajouterUtilisateur, getUtilisateurById, supprimerUtilisateur, updateUtilisateur }
}

export default useUtilisateur