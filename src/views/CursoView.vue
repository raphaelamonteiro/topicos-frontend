<template>
  <div>
    <h1>Cursos</h1>
    <form @submit.prevent="salvarCurso">
      <p>
        <label id="labelSigla" for="sigla">Sigla: </label>
        <input type="text" id="sigla" v-model="curso.sigla" required />
      </p>

      <p>
        <label id="labelNome" for="nome">Nome: </label>
        <input type="text" id="nome" v-model="curso.nome" required />
      </p>

      <button type="submit">Salvar</button>
    </form>
    <p v-if="erro" style="color: red">{{ erro }}</p>

    <input type="text" :value="curso.sigla" @input="siglaAlterada" />
    <p v-if="curso.sigla.length > 3">Sigla muito grande!</p>
    <div v-else>Ok!</div>
    {{ curso.sigla }}
    <button @click="buscarCursos">Buscar Cursos</button>
    <table>
      <thead>
        <th>Id</th>
        <th>Sigla</th>
        <th>Nome</th>
      </thead>
      <tbody>
        <tr v-for="curso in cursos" :key="curso.id">
          <td>{{ curso?.id }}</td>
          <td>{{ curso?.sigla }}</td>
          <td>{{ curso?.nome }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface curso {
  id?: number
  sigla: string
  nome: string
}

const curso = ref<curso>({ sigla: '', nome: '' })

const erro = ref<string | null>(null)

const cursos = ref<curso[]>([
  { id: 1, sigla: 'ADS', nome: 'Análise e Desenvolvimento de Sistemas' },
  { id: 2, sigla: 'BD', nome: 'Banco de Dados' },
])

curso.value.sigla = 'AD'

function siglaAlterada(e: Event) {
  curso.value.sigla = (e.target as HTMLInputElement).value
}

async function salvarCurso() {
  try {
    await axios.post('curso', curso.value)
    await buscarCursos()
    erro.value = null
  } catch (error) {
    erro.value = (error as Error).message
    console.error('Erro ao salvar o curso:', error)
  }
}

async function buscarCursos() {
  cursos.value = (await axios.get('curso')).data
}

onMounted(() => {
  buscarCursos()
})
</script>
