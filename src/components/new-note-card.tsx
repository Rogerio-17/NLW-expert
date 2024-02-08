import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { ChangeEvent, FormEvent, useState } from 'react'
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreate: (content: string) => void
  
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreate }: NewNoteCardProps) {
  const [ shouldShowOnboarding, setSholdShowOnboarding ] = useState(true)
  const [ isRecording, setIsRecording ] = useState(false)
  const [ content, setContent ] = useState('')

  function handleStartEditor() {
    setSholdShowOnboarding(false)
  }

  function handleContentChangrd(event: ChangeEvent<HTMLTextAreaElement>){
    const value = event.target.value

    setContent(value)

    if(!value) {
      setSholdShowOnboarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()
    onNoteCreate(content)
    setContent('')
    setSholdShowOnboarding(true)
    toast.success('Nota criada com sucesso!')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIvailable = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window

    if(!isSpeechRecognitionAPIvailable) {
      toast.error("O navegador não suporta essa funcionalidade!")
      return
    }

    setIsRecording(true)
    setSholdShowOnboarding(false)

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition 

    speechRecognition = new SpeechRecognitionAPI()

    speechRecognition.lang = 'pt-BR'
    speechRecognition.continuous = true
    speechRecognition.maxAlternatives = 1
    speechRecognition.interimResults = true

    speechRecognition.onresult = (event) => {
      console.log(event.results)
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript)

      }, '')

      setContent(transcription)
    }
    
    speechRecognition.start()
  }

  function handleStopRecording() {
   setIsRecording(false)

   if(speechRecognition !== null) {
    speechRecognition.stop()
   }
  }


    return (
      <Dialog.Root>
          <Dialog.Trigger className='rounded-md flex flex-col text-left bg-slate-700 p-5 gap-3 outline-none hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400'>
            <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>
            <p className='text-sm leading-6 text-slate-400 '>Grave uma nota em áudio que será convertida para texto automaticamente.</p>
          </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className='inset-0 fixed bg-black/50'/>
                <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] md:h-[60vh] w-full bg-slate-700 md:rounded-md flex flex-col outline-none'>
                  <Dialog.Close className='absolute right-0 top-0 bg-slate-800 p1.5 text-slate-400 hover:text-slate-100'>
                    <X className='size=5'/>
                  </Dialog.Close>

                  <form onSubmit={handleSaveNote} className='flex-1 flex flex-col'>
                  <div className='flex flex-1 flex-col gap-3 p-5'>
                    <span className='text-sm font-medium text-slate-300'>
                      Adicionar nota
                    </span>
                    {
                     shouldShowOnboarding ? (<p className='text-sm leading-6 text-slate-400 '>
                     Comece gravando uma <button type='button' className='font-medium text-lime-400 hover:underline' onClick={handleStartRecording}> nota em áudio</button>  ou se preferir <button type='button' className='font-medium text-lime-400 hover:underline' 
                     onClick={handleStartEditor}>utilize apenas texto</button>.
                   </p>) : (
                    <textarea 
                    autoFocus
                    className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                    value={content}
                    onChange={handleContentChangrd}
                    ></textarea>
                   )
                    }

                  </div>
                  {
                    isRecording ? (
                      <button
                      type='submit'
                      onClick={handleStopRecording}
                      className={`w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium  ${!isRecording ? 'opacity-80 cursor-not-allowed ' : 'hover:text-slate-100'}`}
                      disabled={!isRecording}
                    >
                      <div className='size-3 rounded-full bg-red-500 animate-pulse' />
                      Gravando! (Clique p/ interromper)
                    </button>
                    ) : (
                      <button
                      type='submit'
                      className={`w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium ${!content ? 'opacity-80 cursor-not-allowed hover:bg-lime-400': 'hover:bg-lime-500'}`}
                      disabled={!content}
                    >
                      Salvar notas
                    </button>
                    )
                  }
                  </form>
                </Dialog.Content>
           </Dialog.Portal>
      </Dialog.Root>
    )
}