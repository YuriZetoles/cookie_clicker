'use client';

import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import confetti from 'canvas-confetti';

interface GameState {
  cookies: number;
  clickPower: number;
  autoClickers: number;
  totalCookiesEarned: number;
  lastMilestone: number;
}

// Marcos para recompensas (em cookies totais)
const MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000, 500000, 1000000];

export default function CookieClicker() {
  const [cookies, setCookies] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalCookiesEarned, setTotalCookiesEarned] = useState(0);
  const [lastMilestone, setLastMilestone] = useState(0);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [notification, setNotification] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem('cookieClickerSave');
    if (savedData) {
      try {
        const gameState: GameState = JSON.parse(savedData);
        setCookies(gameState.cookies || 0);
        setClickPower(gameState.clickPower || 1);
        setAutoClickers(gameState.autoClickers || 0);
        setTotalCookiesEarned(gameState.totalCookiesEarned || 0);
        setLastMilestone(gameState.lastMilestone || 0);
      } catch (error) {
        console.error('Erro ao carregar dados salvos:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Salvar dados no localStorage quando o estado mudar
  useEffect(() => {
    if (isLoaded) {
      const gameState: GameState = {
        cookies,
        clickPower,
        autoClickers,
        totalCookiesEarned,
        lastMilestone
      };
      localStorage.setItem('cookieClickerSave', JSON.stringify(gameState));
    }
  }, [cookies, clickPower, autoClickers, isLoaded, totalCookiesEarned, lastMilestone]);

  // Função para tocar som de celebração
  const playSuccessSound = useCallback(() => {
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      setAudioContext(ctx);
      
      // Som de sucesso simples
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(1200, ctx.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    }
  }, [audioContext]);

  // Função para lançar confetes
  const launchConfetti = useCallback(() => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio)
      });
    }

    fire(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    fire(0.2, {
      spread: 60,
    });

    fire(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    fire(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }, []);

  // Verificar marcos de recompensa
  useEffect(() => {
    const newMilestone = MILESTONES.find(milestone => 
      totalCookiesEarned >= milestone && milestone > lastMilestone
    );
    
    if (newMilestone) {
      setLastMilestone(newMilestone);
      launchConfetti();
      playSuccessSound();
      
      // Mostrar notificação visual
      setNotification({
        message: `🎉 Parabéns! Você alcançou ${newMilestone.toLocaleString()} cookies totais!`,
        visible: true
      });
      
      // Esconder notificação após 4 segundos
      setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, 4000);
    }
  }, [totalCookiesEarned, lastMilestone, launchConfetti, playSuccessSound]);

  // Auto clicker effect
  useEffect(() => {
    if (autoClickers > 0) {
      const interval = setInterval(() => {
        setCookies(prev => prev + autoClickers);
        setTotalCookiesEarned(prev => prev + autoClickers);
        setCookiesPerSecond(autoClickers);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCookiesPerSecond(0);
    }
  }, [autoClickers]);

  const handleCookieClick = () => {
    setCookies(prev => prev + clickPower);
    setTotalCookiesEarned(prev => prev + clickPower);
    
    // Efeito visual para cliques poderosos
    if (clickPower >= 5) {
      confetti({
        particleCount: Math.min(clickPower * 2, 50),
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFA500', '#FFD700', '#FF8C00', '#F4A460']
      });
    }
  };

  const buyClickUpgrade = () => {
    const cost = clickPower * 10;
    if (cookies >= cost) {
      setCookies(cookies - cost);
      setClickPower(clickPower + 1);
    }
  };

  const buyAutoClicker = () => {
    const cost = (autoClickers + 1) * 50;
    if (cookies >= cost) {
      setCookies(cookies - cost);
      setAutoClickers(autoClickers + 1);
    }
  };

  const resetGame = () => {
    if (confirm('Tem certeza que deseja resetar todo o progresso? Esta ação não pode ser desfeita!')) {
      setCookies(0);
      setClickPower(1);
      setAutoClickers(0);
      setTotalCookiesEarned(0);
      setLastMilestone(0);
      localStorage.removeItem('cookieClickerSave');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-200 dark:from-yellow-900 dark:to-orange-900 p-4">
      {/* Notificação de recompensa */}
      {notification.visible && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-2xl border-2 border-white">
            <div className="text-center font-bold text-lg">
              {notification.message}
            </div>
          </div>
        </div>
      )}
      
      {!isLoaded ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-4xl mb-4">🍪</div>
            <div className="text-xl text-orange-800 dark:text-orange-200">
              Carregando seu progresso...
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center py-8">
          <h1 className="text-4xl font-bold text-orange-800 dark:text-orange-200 mb-2">
            🍪 Cookie Clicker
          </h1>
          <div className="text-2xl font-semibold text-orange-700 dark:text-orange-300">
            Cookies: {cookies.toLocaleString()}
          </div>
          {cookiesPerSecond > 0 && (
            <div className="text-lg text-orange-600 dark:text-orange-400">
              {cookiesPerSecond} cookies por segundo
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Cookie Section */}
          <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <button
              onClick={handleCookieClick}
              className="relative transform transition-transform hover:scale-105 active:scale-95 focus:outline-none"
            >
              <Image
                src="/coockie.png"
                alt="Cookie"
                width={200}
                height={200}
                className="drop-shadow-lg hover:drop-shadow-xl transition-all duration-200"
                priority
              />
            </button>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-300 text-center">
              Clique no cookie para ganhar cookies!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              +{clickPower} por clique
            </p>
          </div>

          {/* Upgrades Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-orange-800 dark:text-orange-200 mb-6">
              Melhorias
            </h2>
            
            <div className="space-y-4">
              {/* Click Power Upgrade */}
              <div className="bg-orange-50 dark:bg-gray-700 p-4 rounded-lg border-2 border-orange-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-orange-800 dark:text-orange-200">
                    🔥 Clique Mais Forte
                  </h3>
                  <span className="text-sm text-orange-600 dark:text-orange-400">
                    Nível {clickPower}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Aumenta o poder do seu clique em +1
                </p>
                <button
                  onClick={buyClickUpgrade}
                  disabled={cookies < clickPower * 10}
                  className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Comprar por {(clickPower * 10).toLocaleString()} cookies
                </button>
              </div>

              {/* Auto Clicker Upgrade */}
              <div className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border-2 border-blue-200 dark:border-gray-600">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200">
                    🤖 Auto Clicker
                  </h3>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Quantidade: {autoClickers}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  Gera 1 cookie por segundo automaticamente
                </p>
                <button
                  onClick={buyAutoClicker}
                  disabled={cookies < (autoClickers + 1) * 50}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded transition-colors"
                >
                  Comprar por {((autoClickers + 1) * 50).toLocaleString()} cookies
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">
                📊 Estatísticas
              </h3>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1 mb-4">
                <div>Poder de clique: {clickPower}</div>
                <div>Auto clickers: {autoClickers}</div>
                <div>Cookies por segundo: {cookiesPerSecond}</div>
                <div className="font-semibold text-yellow-600 dark:text-yellow-400 pt-1 border-t border-gray-200 dark:border-gray-600">
                  🏆 Total de cookies obtidos: {totalCookiesEarned.toLocaleString()}
                </div>
                {/* Próximo marco */}
                {(() => {
                  const nextMilestone = MILESTONES.find(milestone => milestone > totalCookiesEarned);
                  if (nextMilestone) {
                    const progress = (totalCookiesEarned / nextMilestone) * 100;
                    return (
                      <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                        <div className="text-xs text-purple-600 dark:text-purple-400 mb-1">
                          🎯 Próxima recompensa: {nextMilestone.toLocaleString()} cookies
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {progress.toFixed(1)}% completo
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
              
              {/* Reset Button */}
              <button
                onClick={resetGame}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
              >
                🔄 Resetar Jogo
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </div>
  );
}
