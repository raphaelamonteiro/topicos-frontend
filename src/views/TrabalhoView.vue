<template>
  <div>
    <form @submit.prevent="cadastraTrabalho">
      <div>
        <label for="titulo">Título:</label>
        <input type="text" id="titulo" v-model="novoTrabalho.titulo" required />
      </div>
      <div>
        <label for="descricao">Descrição:</label>
        <textarea id="descricao" v-model="novoTrabalho.descricao"></textarea>
      </div>
      <div>
        <label for="justificativa">Justificativa:</label>
        <textarea id="justificativa" v-model="novoTrabalho.justificativa"></textarea>
      </div>
      <div>
        <label for="nota">Nota:</label>
        <input
          type="number"
          id="nota"
          v-model.number="novoTrabalho.nota"
          min="0"
          max="10"
          step="0.1"
        />
      </div>
      <div>
        <label for="dataHoraEntrega">Data e Hora de Entrega:</label>
        <input type="datetime-local" id="dataHoraEntrega" v-model="novoTrabalho.dataHoraEntrega" />
      </div>

      <div>
        <label for="aluno">Aluno:</label>
        <select id="aluno" v-model="novoTrabalho.aluno.id" required>
          <option v-for="aluno in alunos" :key="aluno.id" :value="aluno.id">
            {{ aluno.ra }} - {{ aluno.nome }}
          </option>
        </select>
      </div>
      <button type="submit">Cadastrar Trabalho</button>
    </form>
    <form @submit.prevent="pesquisarTrabalhos">
      <div>
        <label for="raConsulta">Consultar por RA:</label>
        <input type="number" id="raConsulta" v-model.number="raConsulta" required />
      </div>
      <div>
        <label for="tituloConsulta">Consultar por Título:</label>
        <input type="text" id="tituloConsulta" v-model="tituloConsulta" required />
      </div>
      <button type="submit">Pesquisar Trabalhos</button>
    </form>
    <button @click="buscarTrabalhos">Buscar Trabalhos</button>
    <p v-if="erro" style="color: red">Erro: {{ erro }}</p>

    <table v-if="trabalhos.length > 0">
      <thead>
        <tr>
          <th>Id</th>
          <th>Titulo</th>
          <th>Status</th>
          <th>Aluno</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="trabalho in trabalhos" :key="trabalho.id">
          <td>{{ trabalho.id }}</td>
          <td>{{ trabalho.titulo }}</td>
          <td v-if="!trabalho.dataHoraEntrega">Pendente</td>
          <td v-else>Entregue há {{ diferencaEmDias(trabalho.dataHoraEntrega) }} dias</td>
          <td>{{ trabalho.aluno.nome }}</td>
        </tr>
      </tbody>
    </table>
    <p v-else>Nenhum registro foi encontrado para os critérios fornecidos.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Aluno {
  id: number
  nome: string
  ra?: number
  dataNascimento?: string
}

interface Trabalho {
  id?: number
  titulo: string
  descricao?: string
  justificativa?: string
  nota?: number
  dataHoraEntrega?: string
  aluno: Aluno
}

const trabalhos = ref<Trabalho[]>([
  {
    id: 1,
    titulo: 'Trabalho 1',
    descricao: 'Descrição do Trabalho 1',
    justificativa: 'Justificativa do Trabalho 1',
    nota: 8.5,
    dataHoraEntrega: new Date('2024-06-01T10:00:00').toISOString(),
    aluno: {
      id: 1,
      nome: 'João Silva',
      ra: 123456,
    },
  },
  {
    id: 2,
    titulo: 'Trabalho 2',
    descricao: 'Descrição do Trabalho 2',
    justificativa: 'Justificativa do Trabalho 2',
    nota: 9.0,
    aluno: {
      id: 2,
      nome: 'Maria Souza',
      ra: 654321,
    },
  },
])

const novoTrabalho = ref<Trabalho>({
  titulo: '',
  descricao: '',
  justificativa: '',
  nota: undefined,
  aluno: {
    id: 0,
    nome: '',
  },
})

const alunos = ref<Aluno[]>([
  {
    id: 1,
    nome: 'João Silva',
    ra: 123456,
  },
  {
    id: 2,
    nome: 'Maria Souza',
    ra: 654321,
  },
])

const raConsulta = ref<number | null>(null)
const tituloConsulta = ref<string | null>(null)

const erro = ref<string | null>(null)

function diferencaEmDias(data: string): number {
  const dataAtual = new Date()
  const dataEntrega = new Date(data)
  const umDia = 1000 * 60 * 60 * 24
  const diferencaEmMilissegundos = Math.abs(dataAtual.getTime() - dataEntrega.getTime())
  return Math.floor(diferencaEmMilissegundos / umDia)
}

async function buscarTrabalhos() {
  try {
    const response = await axios.get<Trabalho[]>('http://localhost:8080/trabalho')
    trabalhos.value = response.data
    erro.value = null
  } catch (error) {
    console.error('Erro ao buscar trabalhos:', error)
    erro.value = (error as Error).message
  }
}

async function buscarAlunos() {
  try {
    const response = await axios.get<Aluno[]>('http://localhost:8080/aluno')
    alunos.value = response.data
    erro.value = null
  } catch (error) {
    console.error('Erro ao buscar alunos:', error)
    erro.value = (error as Error).message
  }
}

async function cadastraTrabalho() {
  try {
    await axios.post<Trabalho>('http://localhost:8080/trabalho', novoTrabalho.value)
    buscarTrabalhos()
    novoTrabalho.value = {
      titulo: '',
      descricao: '',
      justificativa: '',
      nota: undefined,
      aluno: {
        id: 0,
        nome: '',
      },
    }
    erro.value = null
  } catch (error) {
    console.error('Erro ao cadastrar trabalho:', error)
    erro.value = (error as Error).message
  }
}

async function pesquisarTrabalhos() {
  try {
    const response = await axios.get<Trabalho[]>('http://localhost:8080/trabalho/buscar', {
      params: {
        ra: raConsulta.value,
        titulo: tituloConsulta.value,
      },
    })
    trabalhos.value = response.data
    erro.value = null
  } catch (error) {
    console.error('Erro ao buscar trabalhos por RA:', error)
    erro.value = (error as Error).message
  }
}

onMounted(() => {
  buscarTrabalhos()
  buscarAlunos()
})
</script>
