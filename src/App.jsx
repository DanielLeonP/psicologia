import { useEffect, useMemo, useState } from 'react'
import './App.css'

const stationData = [
  {
    code: 'A1',
    title: 'Estación 1',
    topic: 'Memoria y atención',
    description: 'Arranca el recorrido encontrando la pista inicial.',
    question: '¿Cuál de estas habilidades NO se considera parte de la memoria de trabajo?',
    options: ['Atención sostenida', 'Retención temporal', 'Procesamiento de información', 'Coordinación motora'],
    answerIndex: 3,
    explanation:
      'La coordinación motora es una habilidad física. Para avanzar debes enfocarte en los procesos de memoria y atención.',
    next: 'B2',
  },
  {
    code: 'B2',
    title: 'Estación 2',
    topic: 'Aprendizaje significativo',
    description: 'Conecta ideas y descubre el siguiente lugar.',
    question: '¿Qué elemento facilita el aprendizaje significativo?',
    options: ['Memorizar listas sin contexto', 'Relacionar nueva información con experiencias previas', 'Repetir tareas sin reflexión', 'Evitar ejemplos prácticos'],
    answerIndex: 1,
    explanation:
      'El aprendizaje significativo ocurre cuando conectas lo nuevo con lo que ya conoces. Ese es el camino para continuar.',
    next: 'C3',
  },
  {
    code: 'C3',
    title: 'Estación 3',
    topic: 'Motivación',
    description: 'Sigue adelante con energía para lograr la siguiente pista.',
    question: '¿Cuál es una señal de motivación intrínseca?',
    options: ['Trabajar solo por una recompensa externa', 'Hacerlo porque disfrutas el proceso', 'Evitar el esfuerzo', 'Seguir la indicación de otra persona'],
    answerIndex: 1,
    explanation:
      'La motivación intrínseca nace del disfrute del proceso, no de recompensas externas.',
    next: 'D4',
  },
  {
    code: 'D4',
    title: 'Estación 4',
    topic: 'Inteligencias múltiples',
    description: 'Identifica el tipo de inteligencia que resuelve problemas creativos.',
    question: '¿Cuál área se relaciona con la inteligencia lógico-matemática?',
    options: ['Música y ritmo', 'Resolución de problemas numéricos', 'Expresión corporal', 'Empatía emocional'],
    answerIndex: 1,
    explanation:
      'La inteligencia lógico-matemática se relaciona con números, patrones y razonamiento.',
    next: 'E5',
  },
  {
    code: 'E5',
    title: 'Estación 5',
    topic: 'Resolución de problemas',
    description: 'Última estación: demuestra tu capacidad para encontrar soluciones.',
    question: '¿Qué acción define mejor la resolución de problemas?',
    options: ['Ignorar el obstáculo', 'Analizar opciones y elegir la mejor alternativa', 'Actuar sin información', 'Pedir siempre ayuda sin intentar primero'],
    answerIndex: 1,
    explanation:
      'Resolver problemas implica analizar opciones y escoger la mejor alternativa con la información disponible.',
    next: null,
  },
]

function buildLink(code) {
  return `${window.location.origin}${window.location.pathname}?station=${code}`
}

function App() {
  const initialCode = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('station')?.toUpperCase() ?? ''
    : ''

  const [stationCode, setStationCode] = useState(initialCode)
  const [selectedCode, setSelectedCode] = useState(initialCode)
  const [answerIndex, setAnswerIndex] = useState(null)
  const [result, setResult] = useState(null)
  const [progress, setProgress] = useState(() => {
    if (typeof window === 'undefined') return { points: 0, completed: [], current: initialCode || '', stage: initialCode ? 'ready' : 'start' }
    const saved = localStorage.getItem('psicologia-quiz-progress')
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return { points: 0, completed: [], current: initialCode || '', stage: initialCode ? 'ready' : 'start' }
      }
    }
    return { points: 0, completed: [], current: initialCode || '', stage: initialCode ? 'ready' : 'start' }
  })

  const currentStation = useMemo(
    () => stationData.find((station) => station.code === stationCode),
    [stationCode],
  )

  const nextStation = currentStation
    ? stationData.find((station) => station.code === currentStation.next)
    : null

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('psicologia-quiz-progress', JSON.stringify(progress))
    }
  }, [progress])

  const handleStart = () => {
    const code = selectedCode.trim().toUpperCase()
    const next = stationData.find((station) => station.code === code)
    if (!next) {
      setResult({ status: 'error', message: 'Código inicial no válido. Usa uno de los códigos de estación.' })
      return
    }
    setStationCode(next.code)
    setAnswerIndex(null)
    setResult(null)
    setProgress((prev) => ({
      ...prev,
      current: next.code,
      stage: 'ready',
    }))
  }

  const handleAnswer = () => {
    if (answerIndex === null || !currentStation) return
    const isCorrect = answerIndex === currentStation.answerIndex
    if (isCorrect) {
      const completed = progress.completed.includes(currentStation.code)
        ? progress.completed
        : [...progress.completed, currentStation.code]
      if (nextStation) {
        setResult({
          status: 'correct',
          message: `¡Respuesta correcta! Avanza a la siguiente estación con el código ${nextStation.code}.`,
        })
        setProgress({
          points: progress.points + 10,
          completed,
          current: nextStation.code,
          stage: 'ready',
        })
      } else {
        setResult({
          status: 'correct',
          message: '¡Felicidades! Has completado el circuito de estaciones.',
        })
        setProgress({
          points: progress.points + 10,
          completed,
          current: currentStation.code,
          stage: 'completed',
        })
      }
    } else {
      setResult({
        status: 'wrong',
        message: currentStation.explanation,
      })
      setProgress((prev) => ({
        ...prev,
        stage: 'penalty',
      }))
    }
  }

  const handleAdvance = () => {
    if (!nextStation) return
    setStationCode(nextStation.code)
    setSelectedCode(nextStation.code)
    setAnswerIndex(null)
    setResult(null)
    setProgress((prev) => ({
      ...prev,
      current: nextStation.code,
      stage: 'ready',
    }))
  }

  const handleReset = () => {
    setStationCode('')
    setSelectedCode('')
    setAnswerIndex(null)
    setResult(null)
    setProgress({ points: 0, completed: [], current: '', stage: 'start' })
    localStorage.removeItem('psicologia-quiz-progress')
  }

  return (
    <div className="app-shell">
      <div className="container">
        <header className="app-header">
          <div>
            <p className="eyebrow">Juego de estaciones</p>
            <h1>Recorrido QR educativo</h1>
            <p className="lead">
              Forma equipos, escanea el QR de cada estación y responde preguntas. Si aciertas, obtienes la pista para avanzar.
            </p>
          </div>
          <div className="badge">Equipo activo</div>
        </header>

        <div className="cards-grid">
          <section className="card main-card">
            {currentStation ? (
              <>
                <div className="station-header">
                  <span className="station-code">{currentStation.code}</span>
                  <h2>{currentStation.title}</h2>
                  <p className="station-topic">Tema: {currentStation.topic}</p>
                </div>
                <p className="station-description">{currentStation.description}</p>
                <div className="question-panel">
                  <p className="question-label">Pregunta</p>
                  <h3>{currentStation.question}</h3>
                  <div className="option-list">
                    {currentStation.options.map((option, index) => {
                      const selected = answerIndex === index
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`option-button ${selected ? 'selected' : ''}`}
                          onClick={() => setAnswerIndex(index)}
                        >
                          <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                          {option}
                        </button>
                      )
                    })}
                  </div>

                  <div className="actions-row">
                    <button
                      type="button"
                      className="button-primary"
                      onClick={handleAnswer}
                      disabled={answerIndex === null}
                    >
                      Confirmar respuesta
                    </button>
                    <button type="button" className="button-secondary" onClick={handleReset}>
                      Reiniciar juego
                    </button>
                  </div>

                  {result && (
                    <div className={`result ${result.status}`}>
                      <p>{result.message}</p>
                    </div>
                  )}

                  {result?.status === 'correct' && nextStation && (
                    <div className="next-link-card">
                      <p>Siguiente estación: {nextStation.code}</p>
                      <a href={buildLink(nextStation.code)} className="link-button">
                        Abrir enlace directo desde QR
                      </a>
                      <button type="button" className="button-secondary" onClick={handleAdvance}>
                        Continuar en la app
                      </button>
                    </div>
                  )}

                  {progress.stage === 'penalty' && (
                    <div className="penalty-card">
                      <p>
                        Respuesta incorrecta. Resuelvan un reto adicional o esperen 30 segundos antes de intentar
                        nuevamente.
                      </p>
                    </div>
                  )}

                  {progress.stage === 'completed' && (
                    <div className="complete-card">
                      <p>Has completado todas las estaciones. ¡Excelente trabajo!</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="start-card">
                <h2>Comienza el recorrido</h2>
                <p>Ingresa el código de la estación inicial o usa el QR entregado al equipo.</p>
                <div className="field-row">
                  <input
                    type="text"
                    value={selectedCode}
                    onChange={(event) => setSelectedCode(event.target.value.toUpperCase())}
                    placeholder="Código de estación (por ejemplo, A1)"
                  />
                  <button type="button" className="button-primary" onClick={handleStart}>
                    Iniciar estación
                  </button>
                </div>
                <div className="hint-list">
                  <p>Códigos disponibles:</p>
                  <div className="hint-grid">
                    {stationData.map((station) => (
                      <span key={station.code} className="hint-pill">
                        {station.code}
                      </span>
                    ))}
                  </div>
                </div>
                {result?.status === 'error' && <div className="result wrong"><p>{result.message}</p></div>}
              </div>
            )}
          </section>

          <aside className="card status-card">
            <div className="status-block">
              <h3>Resumen del equipo</h3>
              <p className="status-value">{progress.points} puntos</p>
              <p>
                Estaciones completadas: <strong>{progress.completed.length}</strong> / {stationData.length}
              </p>
              <p>Estación actual: <strong>{stationCode || 'Pendiente'}</strong></p>
            </div>
            <div className="status-block">
              <h3>Instrucciones rápidas</h3>
              <ol>
                <li>Forma tu equipo y escanea el QR inicial.</li>
                <li>Responde la pregunta en la app.</li>
                <li>Si es correcta, recibe el siguiente código o enlace.</li>
                <li>Si es incorrecta, resuelve el reto adicional.</li>
              </ol>
            </div>
            <div className="status-block small-block">
              <h3>Cómo funciona el QR</h3>
              <p>Cada QR apunta a un código como <strong>?station=A1</strong> en la URL.</p>
              <a href={buildLink('A1')} className="link-button small-link">
                Ejemplo de enlace QR para A1
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
