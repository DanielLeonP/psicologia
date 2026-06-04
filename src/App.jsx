import { useEffect, useMemo, useRef, useState } from 'react'
import QRCode from 'qrcode'
import jsQR from 'jsqr'
import './App.css'

const questionsData = [
  {
    id: 'Q1',
    question: '¿Cuál es un ejemplo de sensopercepción?',
    options: [
      'Resolver una ecuación matemática.',
      'Oler el aroma de unas tortillas recién hechas y reconocerlo.',
      'Aprender una canción de memoria.',
      'Escribir un ensayo.',
    ],
    answerIndex: 1,
    correct: 'Oler el aroma de unas tortillas recién hechas y reconocerlo.',
  },
  {
    id: 'Q2',
    question: '¿Cuál es un ejemplo de aprendizaje visual?',
    options: [
      'Escuchar un podcast.',
      'Aprender una receta viendo un video.',
      'Practicar un deporte.',
      'Conversar con un amigo.',
    ],
    answerIndex: 1,
    correct: 'Aprender una receta viendo un video.',
  },
  {
    id: 'Q3',
    question: '¿Cuál es un ejemplo de aprendizaje auditivo?',
    options: [
      'Escuchar una explicación del profesor y comprender el tema.',
      'Leer un mapa.',
      'Armar un rompecabezas.',
      'Dibujar una imagen.',
    ],
    answerIndex: 0,
    correct: 'Escuchar una explicación del profesor y comprender el tema.',
  },
  {
    id: 'Q4',
    question: '¿Cuál es un ejemplo de aprendizaje kinestésico?',
    options: ['Leer un libro.', 'Aprender a andar en bicicleta practicando.', 'Escuchar música.', 'Ver una película.'],
    answerIndex: 1,
    correct: 'Aprender a andar en bicicleta practicando.',
  },
  {
    id: 'Q5',
    question: '¿Cuál es un ejemplo de habilidad metacognitiva?',
    options: [
      'Copiar la tarea.',
      'Revisar qué método de estudio te funciona mejor antes de un examen.',
      'Jugar videojuegos.',
      'Ver televisión.',
    ],
    answerIndex: 1,
    correct: 'Revisar qué método de estudio te funciona mejor antes de un examen.',
  },
  {
    id: 'Q6',
    question: '¿Cuál es un ejemplo de pensamiento?',
    options: ['Decidir qué ropa usar según el clima.', 'Respirar.', 'Caminar.', 'Dormir.'],
    answerIndex: 0,
    correct: 'Decidir qué ropa usar según el clima.',
  },
  {
    id: 'Q7',
    question: '¿Cuál es un ejemplo del uso del lenguaje?',
    options: ['Mandar un mensaje para pedir una tarea.', 'Correr en el parque.', 'Comer una fruta.', 'Dormir una siesta.'],
    answerIndex: 0,
    correct: 'Mandar un mensaje para pedir una tarea.',
  },
  {
    id: 'Q8',
    question: '¿Cuál es un ejemplo de inteligencia?',
    options: ['Encontrar una solución cuando se descompone tu celular.', 'Parpadear.', 'Estornudar.', 'Bostezar.'],
    answerIndex: 0,
    correct: 'Encontrar una solución cuando se descompone tu celular.',
  },
  {
    id: 'Q9',
    question: '¿Cuál es un ejemplo de expectativa social?',
    options: ['Saludar al entrar a un salón de clases.', 'Comer cuando tienes hambre.', 'Dormir ocho horas.', 'Hacer ejercicio.'],
    answerIndex: 0,
    correct: 'Saludar al entrar a un salón de clases.',
  },
  {
    id: 'Q10',
    question: '¿Cuál es un ejemplo de una habilidad socioemocional?',
    options: [
      'Resolver un conflicto con un amigo hablando tranquilamente.',
      'Memorizar fechas históricas.',
      'Correr rápido.',
      'Dibujar un paisaje.',
    ],
    answerIndex: 0,
    correct: 'Resolver un conflicto con un amigo hablando tranquilamente.',
  },
]

const riddles = [
  'Cuando Rivis nos saca a regar a donde debemos de llegar.',
  'Tarde siempre eh de llegar cuando más hambriento haz de estar.',
  `Tengo mesas y buen ambiente,
y recibo a toda la gente.
Mi dueña se llama Vero,
¿qué lugar soy, caballero?`,
  'Si un león quieres mirar a su jaula haz de entrar.',
  'Me haz visto con noches buenas y calaveras y deseguro Saba fue el de la idea.',
  '“Ahorita no papito ando vibrando bajísimo”',
  `No soy cuarto ni salón,
pero guardo cada instrumento de limpieza con razón.
Aquí descansan la escoba y el recogedor,
listos para dejar todo mejor.`,
  'Bancas blancas ocuparon mi lugar y por esa razón estoy hasta atrás',
  'Si a lucio oyes gritar ya sabes en dónde está.',
  'Si con el uniforme completo no haz de entrar en esa esquina te haz de quedar.'
]

const qrSource = 'QR'

function shuffle(array) {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildLink(sourceId) {
  if (typeof window === 'undefined') {
    return `?qr=${sourceId}`
  }
  return `${window.location.origin}${window.location.pathname}?qr=${sourceId}`
}

function getQueryQuestionId() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('q')?.toUpperCase() ?? ''
}

function getQueryQrSource() {
  if (typeof window === 'undefined') return ''
  return new URLSearchParams(window.location.search).get('qr') ?? ''
}

function App() {
  const [view, setView] = useState('game')
  const [questionOrder, setQuestionOrder] = useState(() => shuffle(questionsData.map((question) => question.id)))
  const [currentQuestionId, setCurrentQuestionId] = useState('')
  const [completedIds, setCompletedIds] = useState([])
  const [answerIndex, setAnswerIndex] = useState(null)
  const [result, setResult] = useState(null)
  const [qrImages, setQrImages] = useState({})
  const [qrError, setQrError] = useState('')
  const [riddleOrder, setRiddleOrder] = useState(() => shuffle(riddles))
  const riddleIndexRef = useRef(0)
  const [scanning, setScanning] = useState(false)
  const [scanError, setScanError] = useState('')
  const [scanMessage, setScanMessage] = useState('')
  const [scanStream, setScanStream] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const getRandomUncompletedQuestion = () => {
    const available = questionsData.filter((question) => !completedIds.includes(question.id))
    if (available.length === 0) return ''
    return available[Math.floor(Math.random() * available.length)].id
  }

  const getNextRiddle = () => {
    let order = riddleOrder
    if (riddleIndexRef.current >= order.length) {
      order = shuffle(riddles)
      setRiddleOrder(order)
      riddleIndexRef.current = 0
    }
    const riddle = order[riddleIndexRef.current]
    riddleIndexRef.current += 1
    return riddle
  }

  useEffect(() => {
    if (typeof window === 'undefined') return

    const queryId = getQueryQuestionId()
    const qrSource = getQueryQrSource()

    if (queryId && questionsData.some((question) => question.id === queryId)) {
      setCurrentQuestionId(queryId)
      setQuestionOrder(shuffle(questionsData.map((question) => question.id)))
    } else if (qrSource) {
      const nextId = getRandomUncompletedQuestion()
      if (nextId) {
        setCurrentQuestionId(nextId)
        setQuestionOrder(shuffle(questionsData.map((question) => question.id)))
      }
    }
  }, [])

  useEffect(() => {
    const buildImages = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(buildLink(qrSource), {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 240,
        })
        setQrImages({ [qrSource]: dataUrl })
      } catch (error) {
        setQrError('No fue posible generar los códigos QR. Recarga la página.')
      }
    }

    buildImages()
  }, [])

  const currentQuestion = useMemo(
    () => questionsData.find((question) => question.id === currentQuestionId),
    [currentQuestionId],
  )

  const remainingQuestions = useMemo(
    () => questionOrder.filter((id) => id !== currentQuestionId && !completedIds.includes(id)),
    [questionOrder, currentQuestionId, completedIds],
  )

  const hasCompletedGame = completedIds.length === questionsData.length && !currentQuestionId

  const handleStart = () => {
    const nextOrder = shuffle(questionsData.map((question) => question.id))
    setQuestionOrder(nextOrder)
    setCompletedIds([])
    setCurrentQuestionId('')
    setAnswerIndex(null)
    setResult(null)
    setView('game')
    riddleIndexRef.current = 0
    setRiddleOrder(shuffle(riddles))
    openCameraScanner()
  }

  const handleAnswer = () => {
    if (!currentQuestion || answerIndex === null || result?.status === 'riddle' || result?.status === 'correct') return
    if (completedIds.includes(currentQuestion.id)) return

    if (answerIndex === currentQuestion.answerIndex) {
      const nextCompleted = [...completedIds, currentQuestion.id]
      setCompletedIds(nextCompleted)
      // On correct answer, show a riddle that must be solved before scanning QR
      const riddle = getNextRiddle()
      setResult({
        status: 'riddle',
        message: '¡Respuesta correcta! Resuelve este acertijo para continuar.',
        riddle,
      })
      if (nextCompleted.length === questionsData.length) {
        setCurrentQuestionId('')
      }
    } else {
      const riddle = getNextRiddle()
      setResult({
        status: 'wrong',
        message: 'Respuesta incorrecta. Resuelve este acertijo antes de continuar.',
        riddle,
      })
    }
  }

  const handleContinueAfterRiddle = () => {
    setResult(null)
    setAnswerIndex(null)
  }

  const handleSolvedRiddle = () => {
    // mark the riddle as solved and enable QR scanning option
    setResult({ status: 'correct', message: 'Acertaste el acertijo. Ya puedes leer el QR para continuar.' })
  }

  const stopScanning = () => {
    setScanning(false)
    setScanMessage('')
    if (scanStream) {
      scanStream.getTracks().forEach((track) => track.stop())
      setScanStream(null)
    }
  }

  const renderScanner = () => (
    scanning ? (
      <div className="scanner-card">
        <h3>Escaneo de QR</h3>
        <video ref={videoRef} className="qr-scanner-video" autoPlay muted playsInline />
        <canvas ref={canvasRef} hidden />
        <p>{scanMessage}</p>
        {scanError && <p className="error-text">{scanError}</p>}
        <button type="button" className="button-secondary" onClick={stopScanning}>
          Cancelar escaneo
        </button>
      </div>
    ) : null
  )

  const getScannedQuestionId = (data) => {
    if (!data) return ''
    try {
      const url = new URL(data)
      return url.searchParams.get('q')?.toUpperCase() ?? ''
    } catch {
      return ''
    }
  }

  const isScannedQrSource = (data) => {
    if (!data) return false
    try {
      const url = new URL(data)
      return url.searchParams.has('qr')
    } catch {
      return false
    }
  }

  const handleScannedData = (data) => {
    const questionIdFromQr = getScannedQuestionId(data)
    let questionId = ''

    if (questionIdFromQr && questionsData.some((question) => question.id === questionIdFromQr)) {
      questionId = questionIdFromQr
    } else if (isScannedQrSource(data)) {
      questionId = getRandomUncompletedQuestion()
    }

    if (!questionId) {
      setScanError('QR no válido o no hay preguntas disponibles. Escanea otro QR.')
      return
    }

    if (completedIds.includes(questionId)) {
      setScanError('Esta pregunta ya fue contestada. Escanea otro QR para continuar.')
      return
    }

    stopScanning()
    setCurrentQuestionId(questionId)
    setAnswerIndex(null)
    setResult(null)
    setScanError('')
    setScanMessage(`QR leído: ${questionId}`)
  }

  const openCameraScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setScanError('Tu navegador no soporta acceso a la cámara.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setScanStream(stream)
      setScanError('')
      setScanMessage('Apunta al código QR para leer la siguiente pregunta.')
      setScanning(true)
    } catch (error) {
      setScanError('No fue posible abrir la cámara. Verifica permisos e intenta nuevamente.')
    }
  }

  useEffect(() => {
    let animationId
    if (!scanning || !videoRef.current || !canvasRef.current) return undefined

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    const scanFrame = () => {
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        if (code?.data) {
          handleScannedData(code.data)
          return
        }
      }
      animationId = requestAnimationFrame(scanFrame)
    }

    animationId = requestAnimationFrame(scanFrame)
    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [scanning])

  const renderGame = () => {
    if (hasCompletedGame) {
      return (
        <div className="complete-card">
          <h2>Felicidades ganaste</h2>
          <p>Ahora corre al salón por tu premio.</p>
          <div className="summary-card">
            <h3>Preguntas y respuestas correctas</h3>
            <ol>
              {questionsData.map((question) => (
                <li key={question.id}>
                  <strong>{question.question}</strong>
                  <p>Respuesta correcta: {question.correct}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )
    }

    if (!currentQuestion) {
      return (
        <div className="start-card">
          <h2>Inicia el juego</h2>
          <p>Escanea el QR que te entreguen para comenzar con la pregunta que te toque.</p>
          <button type="button" className="button-primary" onClick={handleStart}>
            Escanear QR para comenzar
          </button>
          <p className="small-text">
            El código QR puede abrir cualquier pregunta. Si ya resolviste una pregunta, escanea otro QR para continuar.
          </p>
          {renderScanner()}
        </div>
      )
    }

    return (
      <>
        <div className="station-header">
          <span className="station-code">{currentQuestion.id}</span>
          <h2>Pregunta actual</h2>
          <p className="station-topic">Preguntas completadas: {completedIds.length} / {questionsData.length}</p>
        </div>
        <div className="question-panel">
          <p className="question-label">Pregunta</p>
          <h3>{currentQuestion.question}</h3>
          <div className="option-list">
            {currentQuestion.options.map((option, index) => {
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
            <button type="button" className="button-primary" onClick={handleAnswer} disabled={answerIndex === null || result?.status === 'riddle' || result?.status === 'correct'}>
              Confirmar respuesta
            </button>
          </div>
          {result && (
            <div className={`result ${result.status}`}>
              <p>{result.message}</p>
              {result.status === 'riddle' && <p className="riddle-text">Acertijo: {result.riddle}</p>}
            </div>
          )}

          {result?.status === 'riddle' && (
            <div className="actions-row">
              <button type="button" className="button-secondary" onClick={handleSolvedRiddle}>
                Adiviné el acertijo
              </button>
            </div>
          )}

          {result?.status === 'correct' && (
            <div className="next-step-card">
              <p>{result.message}</p>
              <div className="actions-row">
                <button type="button" className="button-primary" onClick={openCameraScanner}>
                  Leer QR con cámara
                </button>
              </div>
              {renderScanner()}
            </div>
          )}
        </div>
      </>
    )
  }

  const renderQrPage = () => (
    <div className="qr-page">
      <div className="station-header">
        <h2>QR imprimibles</h2>
        <p className="station-topic">Cada código es genérico y puede llevar a cualquier pregunta.</p>
      </div>
      <p className="lead">
        Imprime un único QR y colócalo en el lugar físico. Ese QR funcionará para todo y llevará a una pregunta diferente cada vez.
      </p>
      <div className="qr-grid">
        <div className="qr-card">
          <h3>QR único</h3>
          {qrImages[qrSource] ? (
            <img src={qrImages[qrSource]} alt="QR único" />
          ) : (
            <p>Cargando QR...</p>
          )}
          <p className="qr-link"><strong>{buildLink(qrSource)}</strong></p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="container">
        <header className="app-header">
          <div>
            <p className="eyebrow">Juego educativo</p>
            <h1>Recorrido con códigos QR</h1>
            <p className="lead">
              Responde preguntas, recibe acertijos si fallas y usa los QR para avanzar.
            </p>
          </div>
          <div className="badge">{view === 'game' ? 'Modo juego' : 'Página de QR'}</div>
        </header>

        <div className="tab-buttons">
          <button type="button" className={view === 'game' ? 'tab active' : 'tab'} onClick={() => setView('game')}>
            Juego
          </button>
          <button type="button" className={view === 'qrs' ? 'tab active' : 'tab'} onClick={() => setView('qrs')}>
            QR imprimibles
          </button>
        </div>

        <div className="cards-grid">
          <section className="card main-card">
            {view === 'game' ? renderGame() : renderQrPage()}
          </section>

          <aside className="card status-card">
            <div className="status-block">
              <h3>Progreso</h3>
              <p className="status-value">{completedIds.length} / {questionsData.length}</p>
              <p>Pregunta actual: <strong>{currentQuestion?.id || 'Pendiente'}</strong></p>
            </div>
            <div className="status-block">
              <h3>¿Cómo jugar?</h3>
              <ol>
                <li>Escanea un QR para comenzar con una pregunta.</li>
                <li>Responde la pregunta en la app.</li>
                <li>Si aciertas, vuelve a escanear un QR para continuar con otra pregunta.</li>
                <li>Si fallas, resuelve el acertijo mostrado y vuelve a intentarlo.</li>
              </ol>
            </div>
            <div className="status-block small-block">
              <h3>Notas clave</h3>
              <p>
                Los QR de la pestaña de impresión son genéricos. Cada escaneo da una pregunta diferente no repetida.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
