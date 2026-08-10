'use client';

import Image from 'next/image';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ChevronDown,
  Heart,
  Handshake,
  Menu,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  UsersRound,
  X,
} from 'lucide-react';
import { useState } from 'react';

const properties = [
  {
    badge: 'Verificada por Hecta',
    badgeClass: 'verified',
    title: 'Terreno 57,4 ha en Maule',
    location: 'San Clemente, Maule',
    tags: ['57,4 ha', 'Factibilidad eléctrica', 'Acceso'],
    price: '$1.600.000.000',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=85',
  },
  {
    badge: 'Exclusiva',
    badgeClass: 'exclusive',
    title: 'Parcela 5.000 m² con casa',
    location: 'Pelarco, Maule',
    tags: ['5.000 m²', 'Casa', 'Luz', 'Agua'],
    price: '$95.000.000',
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1100&q=85',
  },
  {
    badge: 'Nueva',
    badgeClass: 'new',
    title: 'Terreno 10 ha orilla de río',
    location: 'Constitución, Maule',
    tags: ['10 ha', 'Orilla de río', 'Bosque nativo'],
    price: '$280.000.000',
    image: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1100&q=85',
  },
  {
    badge: 'Oportunidad',
    badgeClass: 'opportunity',
    title: 'Terreno 2 ha con vista',
    location: 'Teno, Maule',
    tags: ['2 ha', 'Vista panorámica', 'Rol propio'],
    price: '$62.000.000',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1100&q=85',
  },
];

const benefits = [
  { icon: ShieldCheck, title: 'Propiedades verificadas', text: 'Visitamos cada propiedad y verificamos su información.' },
  { icon: Camera, title: 'Fotos y video profesional', text: 'Fotografías y dron para mostrar lo mejor de tu propiedad.' },
  { icon: UsersRound, title: 'Atención personalizada', text: 'Te acompañamos en todo el proceso de venta o compra.' },
  { icon: Handshake, title: 'Solo cobramos al vender', text: 'Comisión de 2,5% + IVA solo cuando la propiedad se vende.' },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [operation, setOperation] = useState('Venta');
  const [message, setMessage] = useState('');

  function submitSearch(event) {
    event.preventDefault();
    setMessage('Búsqueda lista. En la siguiente etapa conectaremos propiedades reales y filtros avanzados.');
  }

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Hecta inicio">
          <Image src="/hecta-logo.png" alt="Hecta Corretaje de Propiedades" width={248} height={110} priority />
        </a>

        <nav className="desktop-nav" aria-label="Navegación principal">
          <a href="#propiedades">Comprar</a>
          <a href="#vender">Vender</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#servicios">Servicios</a>
          <a href="#nosotros">Nosotros</a>
          <a href="#blog">Blog</a>
        </nav>

        <div className="header-actions">
          <button className="login-btn"><UserRound size={19} /> Iniciar sesión</button>
          <a className="primary-btn small" href="/publicar">Publicar propiedad <span>+</span></a>
          <button className="menu-btn" onClick={() => setMenuOpen(v => !v)} aria-label="Abrir menú">
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <nav className="mobile-nav">
            <a href="#propiedades">Comprar</a>
            <a href="#vender">Vender</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#servicios">Servicios</a>
            <a href="#nosotros">Nosotros</a>
          </nav>
        )}
      </header>

      <section id="inicio" className="hero">
        <div className="hero-overlay" />
        <div className="hero-inner">
          <div className="hero-copy">
            <div className="hero-kicker">Compra, vende o arrienda con respaldo profesional</div>
            <h1>Encuentra o vende una propiedad de manera <em>simple.</em></h1>
            <p>Terrenos, parcelas, casas y departamentos con información verificada y respaldo profesional en todo el proceso.</p>
            <div className="hero-buttons">
              <a href="#propiedades" className="primary-btn"><Search size={20} /> Buscar propiedades</a>
              <a href="/publicar" className="secondary-btn"><Upload size={20} /> Publicar mi propiedad</a>
            </div>
            <div className="verified-line"><CheckCircle2 size={20} /> Propiedades verificadas y acompañamiento durante todo el proceso</div>
          </div>

          <form className="search-card" onSubmit={submitSearch}>
            <div className="operation-tabs">
              {['Venta', 'Arriendo', 'Temporada'].map(item => (
                <button type="button" key={item} className={operation === item ? 'active' : ''} onClick={() => setOperation(item)}>{item}</button>
              ))}
            </div>
            <label>Tipo de propiedad
              <select defaultValue="Todos los tipos">
                <option>Todos los tipos</option>
                <option>Terreno</option>
                <option>Parcela</option>
                <option>Casa</option>
                <option>Departamento</option>
              </select>
            </label>
            <label>Ubicación
              <input placeholder="Comuna, ciudad o región" />
            </label>
            <div className="price-row">
              <label>Precio mínimo<input placeholder="$ Mínimo" /></label>
              <label>Precio máximo<input placeholder="$ Máximo" /></label>
            </div>
            <button className="search-submit" type="submit"><Search size={21} /> Buscar propiedades</button>
            <button type="button" className="advanced">Búsqueda avanzada <ChevronDown size={17} /></button>
            {message && <p className="form-message">{message}</p>}
          </form>
        </div>
      </section>

      <section id="servicios" className="benefits">
        {benefits.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <div className="benefit-icon"><Icon size={30} /></div>
            <div><h3>{title}</h3><p>{text}</p></div>
          </article>
        ))}
      </section>

      <section id="propiedades" className="properties-section">
        <div className="section-heading">
          <div><h2>Propiedades destacadas</h2><span /></div>
          <a href="#">Ver todas las propiedades <ArrowRight size={17} /></a>
        </div>

        <div className="property-grid">
          {properties.map(property => (
            <article className="property-card" key={property.title}>
              <div className="property-image">
                <img src={property.image} alt={property.title} />
                <span className={`badge ${property.badgeClass}`}>{property.badge}</span>
                <button className="favorite" aria-label={`Guardar ${property.title}`}><Heart size={19} /></button>
              </div>
              <div className="property-body">
                <h3>{property.title}</h3>
                <p className="location">{property.location}</p>
                <div className="tags">{property.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <strong>{property.price}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="vender" className="sell-section">
        <div className="sell-copy">
          <p className="eyebrow">VENDE CON HECTA</p>
          <h2>Nos encargamos de todo para que vendas al mejor precio y con tranquilidad.</h2>
          <div id="como-funciona" className="steps">
            <div><ShieldCheck /><span>Evaluamos tu propiedad</span></div>
            <ArrowRight className="step-arrow" />
            <div><Camera /><span>Preparamos ficha, fotos y publicación</span></div>
            <ArrowRight className="step-arrow" />
            <div><UsersRound /><span>Gestión de interesados y visitas</span></div>
            <ArrowRight className="step-arrow" />
            <div><Handshake /><span>Negociación y apoyo legal hasta la escritura</span></div>
          </div>
        </div>
        <div className="sell-image" role="img" aria-label="Corredores revisando un terreno" />
        <div className="commission-card">
          <span>Comisión</span>
          <strong>2,5% <small>+ IVA</small></strong>
          <p>solo cuando<br />se vende</p>
          <button>Conoce más</button>
        </div>
      </section>

      <section id="publicar" className="publish-cta">
        <div>
          <span>Publica en menos de 2 minutos</span>
          <h2>¿Tienes una propiedad para vender?</h2>
          <p>Déjanos los datos principales y nuestro equipo te contactará para ayudarte a prepararla y comercializarla.</p>
        </div>
        <a href="/publicar" className="secondary-btn">Comenzar publicación <ArrowRight size={19} /></a>
      </section>

      <footer>
        <Image src="/hecta-logo.png" alt="Hecta" width={190} height={84} />
        <p>© 2026 Hecta Corretaje de Propiedades. Todos los derechos reservados.</p>
      </footer>
    </main>
  );
}
