'use client';

import Image from "next/image";
import { useState, useEffect } from "react";

interface GameState {
  cookies: number;
  clickPower: number;
  autoClickers: number;
  totalCookiesEarned: number;
}

export default function CookieClicker() {
  const [cookies, setCookies] = useState(0);
  const [clickPower, setClickPower] = useState(1);
  const [autoClickers, setAutoClickers] = useState(0);
  const [cookiesPerSecond, setCookiesPerSecond] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const [totalCookiesEarned, setTotalCookiesEarned] = useState(0);

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
        totalCookiesEarned
      };
      localStorage.setItem('cookieClickerSave', JSON.stringify(gameState));
    }
  }, [cookies, clickPower, autoClickers, isLoaded, totalCookiesEarned]);

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
      localStorage.removeItem('cookieClickerSave');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-100 to-orange-200 dark:from-yellow-900 dark:to-orange-900 p-4">
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
