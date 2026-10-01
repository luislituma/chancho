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
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <h1 className="title" style={{ marginBottom: 0 }}>LOS CHEVERES</h1>
          <button 
            onClick={handleAdminLogin}
            style={{ 
              background: isAdmin ? 'var(--danger)' : 'var(--primary)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            title={isAdmin ? "Cerrar sesión" : "Iniciar como admin"}
          >
            {isAdmin ? "🔒" : "🔓"}
          </button>
        </div>
        <p className="subtitle">CHANCHIZA 2026</p>
      </header>

      <main>
        <div className="dashboard-card">
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
                          <span
                            onClick={() => togglePayment(friend.id, index)}
                            style={{ cursor: isAdmin ? 'pointer' : 'default' }}
                            className={`status-badge ${payment.paid ? 'status-paid' : 'status-unpaid'}`}
                          >
                            {payment.paid ? `$${payment.amount} Pagado` : 'Pendiente'}
                          </span>
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
                {Math.round((totalCollected / totalExpected) * 100)}%
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
