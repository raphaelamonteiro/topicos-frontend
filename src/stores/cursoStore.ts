import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

interface curso {
  id?: number
  sigla: string
  nome: string
}

export const cursoStore = defineStore(
  'curso',
  () => {
    const curso = ref<curso>({ sigla: '', nome: '' })

    const erro = ref<string | null>(null)

    const cursos = ref<curso[]>([
      { id: 1, sigla: 'ADS', nome: 'Análise e Desenvolvimento de Sistemas' },
      { id: 2, sigla: 'BD', nome: 'Banco de Dados' },
    ])

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

    return { curso, erro, cursos, salvarCurso, buscarCursos }
  },
  {
    persist: true,
  },
)
