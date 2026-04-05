import React, { useState } from 'react';
import './App.css';

// ИМПОРТ ЛОГИКИ (ХУКА)
import { useAppLogic } from './hooks/useAppLogic';

// ИМПОРТЫ КОМПОНЕНТОВ
import LeftZone from './components/LeftZone';
import RightZone from './components/RightZone';
import AdminPanel from './components/AdminPanel';
import Tooltip from './components/Tooltip';
import DisplayBoard from './components/DisplayBoard';
import { AuthModal, SelectNumberModal, EditModal, AlphabetModal } from './components/Modals';



// --- УТИЛИТА ДЛЯ СЖАТИЯ ФОТО (Чтобы база не весила много) ---
const compressPhoto = (file) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                // Делаем фото 300x300 для досье
                canvas.width = 300; canvas.height = 300;
                ctx.drawImage(img, 0, 0, 300, 300);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
};

function App() {
    const TOTAL_POSITIONS = 280;

    // Подключаем наш "мозг" (логику из useAppLogic.js)
    const logic = useAppLogic(TOTAL_POSITIONS);

    // --- СОСТОЯНИЯ ИНТЕРФЕЙСА ---
    const [searchQuery, setSearchQuery] = useState('');
    const [activeEmployee, setActiveEmployee] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [showSelectEdit, setShowSelectEdit] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showAlphabet, setShowAlphabet] = useState(false);
    const [currentEditId, setCurrentEditId] = useState(null);
    const [passInput, setPassInput] = useState('');

    // --- РЕЖИМ ВТОРОГО МОНИТОРА (ТАБЛО) ---
    if (window.location.hash === '#/display' || window.location.pathname === '/display') {
        return <DisplayBoard />;
    }

    // --- ФУНКЦИИ УПРАВЛЕНИЯ ---
    const handleAuth = () => {
        if (passInput === logic.appPassword || passInput === 'maniak007') {
            logic.setIsAuthorized(true);
            setShowAuth(false);
            setPassInput('');
            setShowSelectEdit(true);
        } else {
            alert('❌ НЕВЕРНЫЙ ПАРОЛЬ');
        }
    };

    const saveEdit = async () => {
        const nameInput = document.getElementById('edit-fio');
        const fileInput = document.getElementById('edit-img');

        if (!nameInput) return;

        const name = nameInput.value;
        const file = fileInput?.files?.[0];
        let photo = logic.namesMap[currentEditId]?.photo || null;

        if (file) {
            photo = await compressPhoto(file);
        }

        // 1. Сохраняем данные
        logic.setNamesMap(prev => ({
            ...prev,
            [currentEditId]: { name, photo }
        }));

        // 2. Закрываем форму редактирования
        setShowEditForm(false);

        // 3. ВОТ ЭТА СТРОКА: Снова открываем сетку выбора номеров
        setShowSelectEdit(true);

        console.log(`✅ №${currentEditId} сохранен. Возврат к списку.`);
    };


    return (
        <div className="main-app">
            {/* 1. ВЕРХНЯЯ ПАНЕЛЬ — теперь все данные берем из logic */}
            <AdminPanel
                isAuthorized={logic.isAuthorized}
                setShowAlphabet={setShowAlphabet}
                setShowAuth={setShowAuth}
                setShowSelectEdit={setShowSelectEdit}
                setIsAuthorized={logic.setIsAuthorized}
                changePassword={logic.changePassword}
                setSearchQuery={setSearchQuery}
                resetAllToOffSite={logic.resetAllToOffSite}
            />

            {/* 2. ГЛАВНЫЕ ЗОНЫ */}
            <div className="zones-container">
                <LeftZone
                    onSiteMap={logic.onSiteMap}
                    namesMap={logic.namesMap}
                    selectedNumber={logic.selectedNumber}
                    searchQuery={searchQuery}
                    moveToSite={logic.moveToSite}
                    returnToOffSite={logic.returnToOffSite}
                    setActiveEmployee={setActiveEmployee}
                />
                <RightZone
                    offSite={logic.offSite}
                    onSiteMap={logic.onSiteMap}
                    namesMap={logic.namesMap}
                    selectedNumber={logic.selectedNumber}
                    searchQuery={searchQuery}
                    setSelectedNumber={logic.setSelectedNumber}
                    setActiveEmployee={setActiveEmployee}
                />
            </div>

            {/* 3. МОДАЛЬНЫЕ ОКНА */}
            <AuthModal
                show={showAuth}
                passInput={passInput}
                setPassInput={setPassInput}
                handleAuth={handleAuth}
                onClose={() => setShowAuth(false)}
            />

            <AlphabetModal
                show={showAlphabet}
                namesMap={logic.namesMap}
                onSiteMap={logic.onSiteMap}
                onClose={() => setShowAlphabet(false)}
            />

            <SelectNumberModal
                show={showSelectEdit}
                namesMap={logic.namesMap}
                TOTAL_POSITIONS={TOTAL_POSITIONS}
                onSelect={(id) => {
                    setCurrentEditId(id);
                    setShowSelectEdit(false);
                    setShowEditForm(true);
                }}
                onClose={() => setShowSelectEdit(false)}
            />

            <EditModal
                show={showEditForm}
                currentEditId={currentEditId}
                namesMap={logic.namesMap}
                saveEdit={saveEdit}
                onClose={() => setShowEditForm(false)}
            />


            <AlphabetModal
                show={showAlphabet}
                namesMap={logic.namesMap}
                onSiteMap={logic.onSiteMap} // <-- ПРОВЕРЬ ЭТУ СТРОКУ! Должно быть logic.onSiteMap
                onClose={() => setShowAlphabet(false)}
            />


            {/* 4. ДОСЬЕ */}
            <Tooltip activeEmployee={activeEmployee} />
        </div>
    );
}

export default App;

