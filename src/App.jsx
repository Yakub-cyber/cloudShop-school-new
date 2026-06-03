import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'

// 👇 ВСТАВЬ СВОЮ ССЫЛКУ (.csv) МЕЖДУ КАВЫЧКАМИ 👇
const GOOGLE_SHEET_CSV_URL =
	'https://docs.google.com/spreadsheets/d/e/2PACX-1vQKCpIqtpLr5MG5F3m3zdS-Ju5epmG2Ab46SokDjGHVw1k0Ab3Ctt__DhZVRZqHNSCPVQ48ELipGGXD/pub?output=csv'

const USERS_DB = [
	{ login: 'yakub', password: '777', name: 'Якуб' },
	{ login: 'student', password: '123', name: 'Стажер' },
]

export default function App() {
	const [page, setPage] = useState('auth')
	const [login, setLogin] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const [currentUser, setCurrentUser] = useState(null)
	const [selectedPlatform, setSelectedPlatform] = useState(null)

	const [lessons, setLessons] = useState([])
	const [isLoading, setIsLoading] = useState(false)

	const fetchLessonsFromSheets = () => {
		if (
			GOOGLE_SHEET_CSV_URL === 'ВСТАВЬ_ССЫЛКУ_СЮДА' ||
			!GOOGLE_SHEET_CSV_URL
		) {
			setLessons([])
			return
		}

		setIsLoading(true)

		fetch(GOOGLE_SHEET_CSV_URL)
			.then(response => response.text())
			.then(csvText => {
				Papa.parse(csvText, {
					header: true,
					skipEmptyLines: true,
					complete: results => {
						// Фильтруем пустые строки, которые случайно могут быть в Google Sheets
						const validLessons = results.data.filter(
							lesson => lesson.title && lesson.title.trim() !== '',
						)
						setLessons(validLessons)
						setIsLoading(false)
					},
					error: err => {
						console.error('Ошибка парсинга:', err)
						setError('Ошибка при чтении данных таблицы.')
						setIsLoading(false)
					},
				})
			})
			.catch(err => {
				console.error('Сетевая ошибка:', err)
				setError('Не удалось загрузить таблицу. Проверьте интернет.')
				setIsLoading(false)
			})
	}

	useEffect(() => {
		if (page === 'student') {
			fetchLessonsFromSheets()
		}
	}, [page])

	const handleAuth = e => {
		e.preventDefault()
		setError('')
		const cleanLogin = login.trim().toLowerCase()

		const user = USERS_DB.find(
			u => u.login === cleanLogin && u.password === password,
		)
		if (user) {
			setCurrentUser(user)
			setPage('student')
			setLogin('')
			setPassword('')
		} else {
			setError('❌ Неверный логин или пароль!')
		}
	}

	const logout = () => {
		setCurrentUser(null)
		setSelectedPlatform(null)
		setPage('auth')
	}

	return (
		<div className='min-h-screen bg-[#09090b] text-[#f4f4f5] font-sans selection:bg-sky-500/30'>
			{page === 'auth' && (
				<div className='flex justify-center items-center min-h-screen p-5 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#18181b] to-[#09090b]'>
					<div className='bg-[#18181b]/80 backdrop-blur-md p-8 rounded-2xl border border-[#27272a] w-full max-w-[380px] text-center shadow-2xl'>
						<div className='text-5xl mb-6'>📊</div>
						<h2 className='text-2xl font-bold mb-2 tracking-tight'>
							CloudShop School
						</h2>
						<p className='text-[#a1a1aa] text-sm mb-8 leading-relaxed'>
							Вход для сотрудников. Данные загружаются из Google Sheets
						</p>

						<form onSubmit={handleAuth} className='flex flex-col gap-4'>
							<input
								type='text'
								placeholder='Логин'
								value={login}
								onChange={e => setLogin(e.target.value)}
								className='p-4 rounded-xl border border-[#27272a] bg-[#09090b] text-white text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all'
								required
							/>
							<input
								type='password'
								placeholder='Пароль'
								value={password}
								onChange={e => setPassword(e.target.value)}
								className='p-4 rounded-xl border border-[#27272a] bg-[#09090b] text-white text-sm outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10 transition-all'
								required
							/>
							{error && (
								<div className='text-red-400 text-sm font-medium text-left bg-red-400/10 p-3 rounded-lg border border-red-400/20'>
									{error}
								</div>
							)}

							<button
								type='submit'
								className='p-4 rounded-xl border-none text-[#09090b] text-base font-bold cursor-pointer mt-2 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 bg-[#38bdf8] shadow-[0_10px_25px_-5px_rgba(56, 189, 248, 0.3)]'
							>
								Войти в систему
							</button>
						</form>
					</div>
				</div>
			)}

			{page === 'student' && (
				<div className='min-h-screen flex flex-col'>
					<header className='sticky top-0 z-10 flex justify-between items-center p-4 px-6 bg-[#18181b]/90 backdrop-blur-lg border-b border-[#27272a] shadow-sm'>
						<div className='flex items-center gap-3 text-sm'>
							<span className='bg-[#27272a] p-2 rounded-full text-lg leading-none'>
								👤
							</span>
							<span className='font-medium text-[#a1a1aa]'>
								Студент: <b className='text-sky-400'>{currentUser?.name}</b>
							</span>
						</div>
						<div className='flex gap-2'>
							<button
								onClick={fetchLessonsFromSheets}
								className='py-2 px-4 bg-emerald-600 text-white border-none rounded-lg cursor-pointer text-sm font-medium transition-all hover:bg-emerald-500 active:scale-95'
							>
								{isLoading ? '🔄 Обновление...' : '🔄 Обновить из БД'}
							</button>
							<button
								onClick={logout}
								className='py-2 px-4 bg-[#27272a] text-[#f4f4f5] border-none rounded-lg cursor-pointer text-sm font-medium transition-all hover:bg-red-500 hover:text-white active:scale-95'
							>
								Выйти
							</button>
						</div>
					</header>

					<main className='flex-1 w-full max-w-4xl mx-auto py-12 px-5'>
						<h1 className='text-center text-3xl font-extrabold mb-3 tracking-tight'>
							Какое устройство у сотрудника?
						</h1>
						<p className='text-center text-[#a1a1aa] text-base mb-12'>
							Выберите платформу для просмотра инструкций
						</p>

						<div className='grid grid-cols-1 md:grid-cols-3 gap-5 mb-14'>
							<button
								onClick={() => setSelectedPlatform('ios')}
								className={`group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${selectedPlatform === 'ios' ? 'border-blue-500 bg-blue-500/10 text-blue-400 shadow-blue-500/20' : 'border-[#27272a] bg-[#18181b] text-white hover:border-[#3f3f46]'}`}
							>
								<span className='text-5xl group-hover:scale-110 transition-transform duration-300'>
									🍏
								</span>
								<span className='font-bold text-lg'>iPhone / iOS</span>
							</button>
							<button
								onClick={() => setSelectedPlatform('android')}
								className={`group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${selectedPlatform === 'android' ? 'border-green-500 bg-green-500/10 text-green-400 shadow-green-500/20' : 'border-[#27272a] bg-[#18181b] text-white hover:border-[#3f3f46]'}`}
							>
								<span className='text-5xl group-hover:scale-110 transition-transform duration-300'>
									🤖
								</span>
								<span className='font-bold text-lg'>Android</span>
							</button>
							<button
								onClick={() => setSelectedPlatform('windows')}
								className={`group flex flex-col items-center gap-4 p-8 rounded-2xl border-2 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${selectedPlatform === 'windows' ? 'border-sky-500 bg-sky-500/10 text-sky-400 shadow-sky-500/20' : 'border-[#27272a] bg-[#18181b] text-white hover:border-[#3f3f46]'}`}
							>
								<span className='text-5xl group-hover:scale-110 transition-transform duration-300'>
									🪟
								</span>
								<span className='font-bold text-lg'>Windows / ПК</span>
							</button>
						</div>

						{selectedPlatform ? (
							<div className='flex flex-col gap-8'>
								<div className='flex items-center gap-3 text-lg font-bold text-[#a1a1aa]'>
									<div className='w-1.5 h-6 rounded-full bg-sky-500'></div>
									Видео для платформы:{' '}
									<span className='text-white uppercase tracking-wider'>
										{selectedPlatform}
									</span>
								</div>

								{GOOGLE_SHEET_CSV_URL === 'ВСТАВЬ_ССЫЛКУ_СЮДА' ? (
									<div className='text-center p-12 bg-red-500/10 rounded-3xl border border-red-500/30 text-red-400 text-lg font-medium'>
										❌ Ошибка: Вы не вставили ссылку на Google Таблицу в код
										(строка 5).
									</div>
								) : isLoading ? (
									<div className='text-center p-12 text-[#a1a1aa] text-lg'>
										⏳ Подключение к базе данных Google...
									</div>
								) : lessons.length === 0 ? (
									<div className='text-center p-12 bg-[#18181b] rounded-2xl border border-[#27272a] text-[#a1a1aa]'>
										В вашей Google Таблице пока нет уроков. Добавьте их и
										нажмите "Обновить".
									</div>
								) : (
									lessons.map((lesson, index) => (
										<div
											key={index}
											className='bg-[#18181b] p-6 md:p-8 rounded-3xl border border-[#27272a] shadow-lg'
										>
											<h3 className='text-xl md:text-2xl font-bold mb-6'>
												{lesson.title}
											</h3>
											<div className='relative pb-[56.25%] h-0 overflow-hidden rounded-2xl bg-black border border-[#27272a]'>
												<iframe
													src={
														lesson[selectedPlatform] ||
														'https://www.youtube.com/embed/dQw4w9WgXcQ'
													}
													className='absolute top-0 left-0 w-full h-full'
													frameBorder='0'
													allowFullScreen
													title={lesson.title}
												></iframe>
											</div>
										</div>
									))
								)}
							</div>
						) : (
							<div className='text-center p-12 bg-[#18181b]/50 rounded-3xl border border-[#27272a] border-dashed text-[#a1a1aa] text-lg'>
								👆 Выберите платформу, чтобы загрузить видео
							</div>
						)}
					</main>
				</div>
			)}
		</div>
	)
}
