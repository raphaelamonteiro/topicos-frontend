<template>
  <div class="opcao-container">
    <h2>Inclua Opções!</h2>

    <div class="form-section">
      <h3>Nova Opção</h3>
      <p v-if="erroMensagem" class="erro">{{ erroMensagem }}</p>

      <form @submit.prevent="cadastrar">
        <div class="input-group">
          <label for="texto">Texto da Opção (Obrigatório):</label>
          <input id="texto" v-model="novaOpcao.texto" type="text" required />
        </div>

        <div class="input-group">
          <label for="explicacao">Explicação:</label>
          <textarea id="explicacao" v-model="novaOpcao.explicacao" type="text" />
        </div>
        <div class="input-group">
          <label for="dataCriacao">Data de Criação:</label>
          <input id="dataCriacao" v-model="novaOpcao.dataCriacao" type="date" />
        </div>

        <div class="input-group">
          <label for="correta">
            <input id="correta" v-model="novaOpcao.correta" type="checkbox" />
            Opção Correta
          </label>
        </div>

        <div class="input-group">
          <label for="questaoId">Questão Associada (Obrigatório):</label>
          <select id="questaoId" v-model="novaOpcao.questaoId" required>
            <option value="">Selecione uma questão...</option>
            <option v-for="q in questoes" :key="q.id" :value="q.id">
              {{ q.enunciado }} (Avaliação: {{ q.avaliacao?.titulo || 'Sem título' }})
            </option>
          </select>
        </div>

        <button type="submit">Cadastrar Opção</button>
      </form>
    </div>

    <div class="search-section">
      <h3>Pesquisar Opções</h3>
      <div class="search-bar">
        <input v-model="filtro.texto" type="text" placeholder="Buscar por texto..." />
        <select v-model="filtro.questaoId">
          <option value="">Todas as questões</option>
          <option v-for="q in questoes" :key="q.id" :value="q.id">
            {{ q.enunciado }} - (Avaliação: {{ q.avaliacao?.titulo || 'Sem título' }})
          </option>
        </select>

        <button @click="pesquisar">Pesquisar</button>
        <button @click="limparBusca">Limpar</button>
      </div>
    </div>

    <div class="table-section">
      <div v-if="listaVazia" class="mensagem-vazia">
        Nenhum registro foi encontrado para os critérios fornecidos.
      </div>

      <table v-else>
        <thead>
          <tr>
            <th>ID</th>
            <th>Texto</th>
            <th>ID Questão</th>
            <th>Enunciado da Questão</th>
            <th>Data de Criação</th>
            <th>Antiguidade</th>
            <th>Status (Correta)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="opcao in opcoes" :key="opcao.id">
            <td>{{ opcao.id }}</td>
            <td>{{ opcao.texto }}</td>
            <td>{{ opcao.questao?.id || opcao.questaoId }}</td>
            <td>{{ opcao.questao?.enunciado || '-' }}</td>
            <td>{{ opcao.dataCriacao }}</td>
            <td>{{ calcularAntiguidade(opcao.dataCriacao) }}</td>
            <td>{{ opcao.correta ? 'Sim' : 'Não' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

interface Avaliacao {
  id?: number
  titulo?: string
}

interface Questao {
  id: number
  enunciado: string
  avaliacao?: Avaliacao
}

interface Opcao {
  id?: number
  texto: string
  explicacao?: string
  correta?: boolean
  dataCriacao?: string
  questao?: Questao
  questaoId?: number | string
}

const opcoes = ref<Opcao[]>([])
const todasOpcoes = ref<Opcao[]>([])
const questoes = ref<Questao[]>([])
const listaVazia = ref(false)
const erroMensagem = ref('')

const novaOpcao = ref({
  texto: '',
  explicacao: '',
  correta: false,
  questaoId: '',
  dataCriacao: '',
})

const filtro = ref({
  texto: '',
  questaoId: '',
})

const calcularAntiguidade = (dataCriacao?: string) => {
  if (!dataCriacao) return '-'
  const hoje = new Date()
  const criacao = new Date(dataCriacao)
  hoje.setHours(0, 0, 0, 0)
  criacao.setHours(0, 0, 0, 0)

  const diffTime = Math.abs(hoje.getTime() - criacao.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays === 0 ? 'Hoje' : diffDays === 1 ? '1 dia' : `${diffDays} dias`
}

const carregarDados = async () => {
  try {
    const resOpcoes = await axios.get<Opcao[]>('http://localhost:8080/opcao')

    todasOpcoes.value = resOpcoes.data
    opcoes.value = resOpcoes.data
    listaVazia.value = opcoes.value.length === 0

    const resQuestoes = await axios.get<Questao[]>('http://localhost:8080/questao')
    questoes.value = resQuestoes.data
  } catch (error) {
    console.error('Erro ao carregar dados', error)
  }
}

const cadastrar = async () => {
  erroMensagem.value = ''
  if (!novaOpcao.value.texto || !novaOpcao.value.questaoId) {
    erroMensagem.value = 'Preencha todos os campos obrigatórios.'
    return
  }

  try {
    await axios.post('http://localhost:8080/opcao', {
      texto: novaOpcao.value.texto,
      explicacao: novaOpcao.value.explicacao || undefined,
      correta: novaOpcao.value.correta,
      questao: { id: Number(novaOpcao.value.questaoId) },
      dataCriacao: novaOpcao.value.dataCriacao || undefined,
    })

    // limpa input e atualiza tabela
    novaOpcao.value = { texto: '', explicacao: '', correta: false, questaoId: '', dataCriacao: '' }
    await carregarDados()
  } catch (error) {
    erroMensagem.value = 'Erro ao cadastrar opção.'
    console.error(error)
  }
}

const pesquisar = async () => {
  if (filtro.value.questaoId) {
    try {
      const params: any = { questaoId: filtro.value.questaoId }
      if (filtro.value.texto) {
        params.texto = filtro.value.texto
      }

      const response = await axios.get<Opcao[]>('http://localhost:8080/opcao/buscar', { params })
      opcoes.value = response.data
      listaVazia.value = opcoes.value.length === 0
    } catch (error) {
      console.error('Erro na busca', error)
    }
  } else {
    let resultado = todasOpcoes.value
    if (filtro.value.texto) {
      resultado = resultado.filter((o) =>
        o.texto.toLowerCase().includes(filtro.value.texto.toLowerCase()),
      )
    }
    opcoes.value = resultado
    listaVazia.value = resultado.length === 0
  }
}

const limparBusca = async () => {
  filtro.value = { texto: '', questaoId: '' }
  await carregarDados()
}

onMounted(() => {
  carregarDados()
})
</script>

<style scoped>
.opcao-container {
  padding: 1rem;
}
.form-section,
.search-section,
.table-section {
  margin-bottom: 1.5rem;
}
.input-group {
  margin-bottom: 0.75rem;
}

.erro {
  color: red;
}
table {
  width: 100%;
  border-collapse: collapse;
}
</style>
