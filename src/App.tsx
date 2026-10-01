import { useState, useEffect } from 'react';
import './App.css';
import { data as initialData, MONTHS, QUOTA_AMOUNT, type Friend } from './data';
import { supabase } from './supabase';

function App() {
  const [friends, setFriends] = useState<Friend[]>(initialData);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
            setFriends(parsed as Friend[]);
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
    const password = prompt("Ingresa la contraseña de administrador:");
    if (password === "chancho26") {
      setIsAdmin(true);
      alert("Modo administrador activado. Ahora puedes hacer clic en las cuotas para cambiarlas.");
    } else if (password !== null) {
      alert("Contraseña incorrecta");
    }
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
            className={`admin-button ${isAdmin ? 'admin-active' : ''}`}
            title={isAdmin ? "Cerrar sesión" : "Iniciar como admin"}
          >
            <span aria-hidden="true">{isAdmin ? "🔒" : "🔓"}</span>
            <span>{isAdmin ? 'Admin activo' : 'Acceso admin'}</span>
          </button>
        </div>
        <p className="subtitle">CHANCHIZA · Seguimiento de cuotas</p>
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
                      <td>{friend.name}</td>
                      {friend.payments.map((payment, index) => (
                        <td key={`${friend.id}-${index}`}>
                          <button
                            onClick={() => togglePayment(friend.id, index)}
                            disabled={!isAdmin}
                            className={`status-badge payment-button ${payment.paid ? 'status-paid' : 'status-unpaid'}`}
                          >
                            <span className="status-dot" aria-hidden="true" />
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
                      <h3>{friend.name}</h3>
                      <p>{friendTotal} de {friend.payments.length * QUOTA_AMOUNT} recaudados</p>
                    </div>
                    <strong>${friendTotal}</strong>
                  </div>
                  <div className="mobile-payments">
                    {friend.payments.map((payment, index) => (
                      <div className="mobile-payment" key={`${friend.id}-mobile-${index}`}>
                        <span className="mobile-month">{payment.month.slice(0, 3)}</span>
                        <button
                          onClick={() => togglePayment(friend.id, index)}
                          disabled={!isAdmin}
                          className={`mobile-status ${payment.paid ? 'status-paid' : 'status-unpaid'}`}
                          aria-label={`${payment.month}: ${payment.paid ? 'pagado' : 'pendiente'}`}
                        >
                          <span className="status-dot" aria-hidden="true" />
                          {payment.paid ? 'OK' : '--'}
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
    </div>
  );
}

export default App;
