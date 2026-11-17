<template>
  <div>
    <h1>Cursos</h1>
    <form @submit.prevent="store.salvarCurso">
      <p>
        <label id="labelSigla" for="sigla">Sigla: </label>
        <input type="text" id="sigla" v-model="store.curso.sigla" required />
      </p>

      <p>
        <label id="labelNome" for="nome">Nome: </label>
        <input type="text" id="nome" v-model="store.curso.nome" required />
      </p>

      <button type="submit">Salvar</button>
    </form>

    <input type="text" :value="store.curso.sigla" @input="siglaAlterada" />
    <p v-if="store.curso.sigla.length > 3">Sigla muito grande!</p>
    <div v-else>Ok!</div>
    {{ store.curso.sigla }}
    <button @click="store.buscarCursos">Buscar Cursos</button>
    <table>
      <thead>
        <tr>
          <th>Id</th>
          <th>Sigla</th>
          <th>Nome</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="curso in store.cursos" :key="curso.id">
          <td>{{ curso?.id }}</td>
          <td>{{ curso?.sigla }}</td>
          <td>{{ curso?.nome }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { cursoStore } from '@/stores/cursoStore'

const store = cursoStore()

function siglaAlterada(e: Event) {
  store.curso.sigla = (e.target as HTMLInputElement).value
}

onMounted(() => {
  store.buscarCursos()
})
</script>
