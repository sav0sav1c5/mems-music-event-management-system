import { useState } from 'react';
import './NegotiationReports.css';

interface EventNegotiationSummary {
  eventId: number;
  eventName: string;
  eventDate: string;
  ukupnoPregovora: number;
  uspesnoZavrsenih: number;
  ukupnaVrednost: number;
  prosecnaVrednost: number;
  brojPerformera: number;
}

interface PerformerPhaseStats {
  performerId: number;
  performerName: string;
  zanr: string;
  trenutnaFaza: number;
  brojPregovora: number;
  brojEvenata: number;
  ukupnaPonudjenaCena: number;
  prosecnaPonudjenaCena: number;
  minCena: number;
  maxCena: number;
  zavrsenih: number;
  uToku: number;
}

export default function NegotiationReports() {
  const [eventReport, setEventReport] = useState<EventNegotiationSummary[]>([]);
  const [performerReport, setPerformerReport] = useState<PerformerPhaseStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'performers'>('events');

  const fetchEventReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5255/api/Reports/negotiations/by-events');
      if (!response.ok) throw new Error('Greška pri učitavanju izveštaja');
      const data = await response.json();
      setEventReport(data);
      setActiveTab('events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepoznata greška');
    } finally {
      setLoading(false);
    }
  };

  const fetchPerformerReport = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5255/api/Reports/negotiations/by-performer-phases');
      if (!response.ok) throw new Error('Greška pri učitavanju izveštaja');
      const data = await response.json();
      setPerformerReport(data);
      setActiveTab('performers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepoznata greška');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sr-RS', {
      style: 'currency',
      currency: 'RSD',
      minimumFractionDigits: 2
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  return (
    <div className="negotiation-reports">
      <h1>Kompleksni Izveštaji o Pregovorima</h1>
      
      <div className="report-buttons">
        <button 
          onClick={fetchEventReport} 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading && activeTab === 'events' ? 'Učitavanje...' : 'Izveštaj po Eventima'}
        </button>
        
        <button 
          onClick={fetchPerformerReport} 
          disabled={loading}
          className="btn btn-secondary"
        >
          {loading && activeTab === 'performers' ? 'Učitavanje...' : 'Izveštaj po Performerima'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Event Report Table */}
      {activeTab === 'events' && eventReport.length > 0 && (
        <div className="report-section">
          <h2>Izveštaj o Pregovorima po Eventima</h2>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Event ID</th>
                  <th>Naziv Eventa</th>
                  <th>Datum</th>
                  <th>Ukupno Pregovora</th>
                  <th>Završenih</th>
                  <th>Ukupna Vrednost</th>
                  <th>Prosečna Vrednost</th>
                  <th>Broj Performera</th>
                </tr>
              </thead>
              <tbody>
                {eventReport.map((item) => (
                  <tr key={item.eventId}>
                    <td>{item.eventId}</td>
                    <td>{item.eventName}</td>
                    <td>{formatDate(item.eventDate)}</td>
                    <td>{item.ukupnoPregovora}</td>
                    <td>{item.uspesnoZavrsenih}</td>
                    <td>{formatCurrency(item.ukupnaVrednost)}</td>
                    <td>{formatCurrency(item.prosecnaVrednost)}</td>
                    <td>{item.brojPerformera}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Performer Phase Report Table */}
      {activeTab === 'performers' && performerReport.length > 0 && (
        <div className="report-section">
          <h2>Izveštaj o Pregovorima po Performerima i Fazama</h2>
          <div className="table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>Performer</th>
                  <th>Žanr</th>
                  <th>Faza</th>
                  <th>Broj Pregovora</th>
                  <th>Broj Evenata</th>
                  <th>Završenih</th>
                  <th>U Toku</th>
                  <th>Ukupna Cena</th>
                  <th>Prosečna Cena</th>
                  <th>Min Cena</th>
                  <th>Max Cena</th>
                </tr>
              </thead>
              <tbody>
                {performerReport.map((item, index) => (
                  <tr key={`${item.performerId}-${item.trenutnaFaza}-${index}`}>
                    <td>{item.performerName}</td>
                    <td>{item.zanr}</td>
                    <td>{item.trenutnaFaza}</td>
                    <td>{item.brojPregovora}</td>
                    <td>{item.brojEvenata}</td>
                    <td>{item.zavrsenih}</td>
                    <td>{item.uToku}</td>
                    <td>{formatCurrency(item.ukupnaPonudjenaCena)}</td>
                    <td>{formatCurrency(item.prosecnaPonudjenaCena)}</td>
                    <td>{formatCurrency(item.minCena)}</td>
                    <td>{formatCurrency(item.maxCena)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
