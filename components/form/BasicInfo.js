"use client";

const TIPOS_PROPIEDAD = [
  "Terreno",
  "Parcela",
  "Campo",
  "Casa",
  "Departamento",
  "Oficina",
  "Local comercial",
  "Bodega",
  "Industrial",
];

export default function BasicInfo({
  form,
  onChange,
}) {
  return (
    <section style={styles.section}>
      <h2 style={styles.sectionTitle}>
        Información principal
      </h2>

      <div style={styles.grid2}>
        <label style={styles.label}>
          Operación

          <select
            name="operacion"
            value={form.operacion}
            onChange={onChange}
            style={styles.input}
          >
            <option value="Venta">
              Venta
            </option>

            <option value="Arriendo">
              Arriendo
            </option>

            <option value="Temporada">
              Temporada
            </option>
          </select>
        </label>

        <label style={styles.label}>
          Tipo de propiedad

          <select
            name="tipo"
            value={form.tipo}
            onChange={onChange}
            style={styles.input}
          >
            {TIPOS_PROPIEDAD.map((tipo) => (
              <option
                key={tipo}
                value={tipo}
              >
                {tipo}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label style={styles.label}>
        Título

        <input
          required
          name="titulo"
          value={form.titulo}
          onChange={onChange}
          style={styles.input}
          placeholder="Ej.: Terreno agrícola de 57 hectáreas en Maule"
        />
      </label>

      <label style={styles.label}>
        Descripción

        <textarea
          required
          name="descripcion"
          value={form.descripcion}
          onChange={onChange}
          rows={7}
          style={styles.textarea}
          placeholder="Describe la propiedad, sus accesos, servicios y principales atributos."
        />
      </label>
    </section>
  );
}

const styles = {
  section: {
    marginBottom: 20,
    padding: 28,
    border: "1px solid #dedbd1",
    borderRadius: 20,
    background: "#fff",
    boxShadow:
      "0 10px 28px rgba(18,59,42,.06)",
  },

  sectionTitle: {
    margin: "0 0 22px",
    fontSize: 22,
  },

  grid2: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(250px,1fr))",
    gap: 18,
  },

  label: {
    display: "grid",
    gap: 8,
    marginBottom: 18,
    fontSize: 14,
    fontWeight: 750,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d6d8d3",
    borderRadius: 12,
    background: "#fff",
    fontSize: 16,
  },

  textarea: {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 15px",
    border: "1px solid #d6d8d3",
    borderRadius: 12,
    fontFamily: "inherit",
    fontSize: 16,
    resize: "vertical",
  },
};