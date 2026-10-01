import { useState, useEffect, type FormEvent } from 'react';
import './App.css';
import { data as initialData, MONTHS, QUOTA_AMOUNT, type Friend } from './data';
import { supabase } from './supabase';

const MOBILE_MONTH_NAMES: Record<string, string> = {
  Agosto: 'AGO',
  Septiembre: 'SEP',
  Octubre: 'OCT',
  Noviembre: 'NOV',
  Diciembre: 'DIC',
};

const getInitials = (name: string) => name
  .split(' ')
  .map(part => part[0])
  .join('')
  .slice(0, 2)
  .toUpperCase();

const normalizeFriends = (friends: Friend[]): Friend[] => friends.map(friend => ({
  ...friend,
  name: friend.name.replace(/\bLituana\b/gi, 'Lituma'),
}));

function App() {
  const [friends, setFriends] = useState<Friend[]>(initialData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Fetch initial data from Supabase
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const { data, error } = await supabase
          .from('chancho_state')
          .select('data')
          .eq('id', 1)
          .single();

        if (error) throw error;
        if (data && data.data) {
          let parsed = data.data;
          if (typeof parsed === 'string') {
            try { parsed = JSON.parse(parsed); } catch (e) {}
          }
          if (Array.isArray(parsed)) {
            setFriends(normalizeFriends(parsed as Friend[]));
          }
        }
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only run if Supabase is configured
    if (import.meta.env.VITE_SUPABASE_URL) {
      fetchFriends();
    } else {
      setIsLoading(false);
    }
  }, []);

  // Function to save to Supabase
  const saveToSupabase = async (updatedFriends: Friend[]) => {
    try {
      const { error } = await supabase
        .from('chancho_state')
        .update({ data: updatedFriends })
        .eq('id', 1);
      
      if (error) throw error;
    } catch (err) {
      console.error("Error saving data to Supabase:", err);
      alert("Error al guardar en la base de datos.");
    }
  };

  const totalExpected = friends.length * MONTHS.length * QUOTA_AMOUNT;

  const totalCollected = friends.reduce((total, friend) => {
    return total + friend.payments.reduce((sum, payment) => {
      return sum + (payment.paid ? payment.amount : 0);
    }, 0);
  }, 0);

  const progress = totalExpected > 0 ? Math.round((totalCollected / totalExpected) * 100) : 0;

  const handleAdminLogin = () => {
    if (isAdmin) {
      setIsAdmin(false);
      return;
    }
    setPassword('');
    setPasswordError('');
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password === 'chancho26') {
      setIsAdmin(true);
      setIsPasswordModalOpen(false);
      return;
    }
    setPasswordError('Contraseña incorrecta');
  };

  const togglePayment = (friendId: string, monthIndex: number) => {
    if (!isAdmin) return;

    const newFriends = friends.map(friend => {
      if (friend.id === friendId) {
        const newPayments = [...friend.payments];
        newPayments[monthIndex].paid = !newPayments[monthIndex].paid;
        return { ...friend, payments: newPayments };
      }
      return friend;
    });

    setFriends(newFriends);
    saveToSupabase(newFriends);
  };

  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', fontSize: '2rem' }}>Cargando...</div>;
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="brand-row">
          <div>
            <p className="eyebrow">Fondo común · 2026</p>
            <h1 className="title">LOS CHEVERES</h1>
          </div>
          <button 
            onClick={handleAdminLogin}
            className={`admin-button payment-float ${isAdmin ? 'admin-active' : ''}`}
            title={isAdmin ? "Cerrar modo de pago" : "Activar modo de pago"}
          >
            <span aria-hidden="true">💳</span>
            <span>{isAdmin ? 'Cerrar' : 'Pagar'}</span>
          </button>
        </div>
        <p className="subtitle">CHANCHIZA · Seguimiento de cuotas</p>
        <div className="group-banner">
          <span className="banner-party" aria-hidden="true">🎉</span>
          <div>
            <p className="banner-kicker">Una meta, un solo grupo</p>
            <strong>La chanchiza se construye entre todos</strong>
          </div>
          <span className="banner-mark" aria-hidden="true">✦</span>
        </div>
      </header>

      <main>
        <div className="dashboard-card">
          <div className="dashboard-intro">
            <div>
              <p className="section-kicker">Estado de la colecta</p>
              <h2>Cuotas del grupo</h2>
            </div>
            <span className="member-count">{friends.length} amigos</span>
          </div>

          <div className="table-responsive">
            <table className="quotas-table">
              <thead>
                <tr>
                  <th>Amigo</th>
                  {MONTHS.map(month => (
                    <th key={month}>{month}</th>
                  ))}
                  <th>Total Pagado</th>
                </tr>
              </thead>
              <tbody>
                {friends.map(friend => {
                  const friendTotal = friend.payments.reduce(
                    (sum, payment) => sum + (payment.paid ? payment.amount : 0), 0
                  );

                  return (
                    <tr key={friend.id}>
                      <td>
                        <span className="friend-identity">
                          <span className="avatar" aria-hidden="true">{getInitials(friend.name)}</span>
                          {friend.name}
                        </span>
                      </td>
                      {friend.payments.map((payment, index) => (
                        <td key={`${friend.id}-${index}`}>
                          <button
                            onClick={() => togglePayment(friend.id, index)}
                            disabled={!isAdmin}
                            className={`status-badge payment-button ${payment.paid ? 'status-paid' : 'status-unpaid'}`}
                          >
                            {payment.paid ? `$${payment.amount} Pagado` : 'Pendiente'}
                          </button>
                        </td>
                      ))}
                      <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>
                        ${friendTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="mobile-friends" aria-label="Cuotas por amigo">
            {friends.map(friend => {
              const friendTotal = friend.payments.reduce(
                (sum, payment) => sum + (payment.paid ? payment.amount : 0), 0
              );

              return (
                <article className="friend-card" key={friend.id}>
                  <div className="friend-card-header">
                    <div>
                      <h3>
                        <span className="avatar" aria-hidden="true">{getInitials(friend.name)}</span>
                        {friend.name}
                      </h3>
                      <p>{friendTotal} de {friend.payments.length * QUOTA_AMOUNT} recaudados</p>
                    </div>
                    <strong>${friendTotal}</strong>
                  </div>
                  <div className="mobile-payments">
                    {friend.payments.map((payment, index) => (
                      <div className="mobile-payment" key={`${friend.id}-mobile-${index}`}>
                        <span className="mobile-month">{MOBILE_MONTH_NAMES[payment.month] ?? payment.month.slice(0, 3).toUpperCase()}</span>
                        <button
                          onClick={() => togglePayment(friend.id, index)}
                          disabled={!isAdmin}
                          className={`mobile-status ${payment.paid ? 'status-paid' : 'status-unpaid'}`}
                          aria-label={`${payment.month}: ${payment.paid ? 'pagado' : 'pendiente'}`}
                        >
                          {payment.paid ? 'OK' : 'X'}
                        </button>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="total-summary">
            <div className="summary-item">
              <span className="summary-label">Total Esperado</span>
              <span className="summary-value">${totalExpected}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total Recaudado</span>
              <span className="summary-value highlight">${totalCollected}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Progreso</span>
              <span className="summary-value">
                {progress}%
              </span>
            </div>
          </div>
          <div className="progress-track" aria-label={`Progreso de la colecta: ${progress}%`}>
            <span style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
        </div>
      </main>

      {isPasswordModalOpen && (
        <div className="password-overlay" onClick={() => setIsPasswordModalOpen(false)}>
          <form className="password-modal" onClick={event => event.stopPropagation()} onSubmit={handlePasswordSubmit}>
            <div className="password-modal-icon" aria-hidden="true">💳</div>
            <p className="section-kicker">Modo de pago</p>
            <h2>Ingresa tu contraseña</h2>
            <p className="password-help">Activa el modo de pago para registrar cuotas.</p>
            <label htmlFor="admin-password">Contraseña</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={event => setPassword(event.target.value)}
              autoFocus
              autoComplete="current-password"
            />
            {passwordError && <p className="password-error" role="alert">{passwordError}</p>}
            <div className="password-actions">
              <button type="button" className="modal-cancel" onClick={() => setIsPasswordModalOpen(false)}>
                Cancelar
              </button>
              <button type="submit" className="modal-submit">
                Ingresar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
