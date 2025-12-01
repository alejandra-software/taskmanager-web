import { useEffect, useState } from "react";
import {
  getTasks,
  getCategories,
  createTask,
  deleteTask,
  updateTask,
} from "./api";
import type { Task, Category, TaskCreateDto } from "./types";

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // formulario
  const [form, setForm] = useState<TaskCreateDto>({
    title: "",
    description: "",
    categoryId: undefined,
  });

  // id de la tarea que se está editando (null = crear nueva)
  const [editingId, setEditingId] = useState<number | null>(null);

  // =========================
  // Cargar datos iniciales
  // =========================
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [tasksRes, categoriesRes] = await Promise.all([
          getTasks(),
          getCategories(),
        ]);
        setTasks(tasksRes);
        setCategories(categoriesRes);
      } catch (err) {
        console.error(err);
        setError("Error al cargar datos. ¿Está corriendo el backend?");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // =========================
  // Manejo del formulario
  // =========================
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "categoryId") {
      setForm((prev: TaskCreateDto) => ({
        ...prev,
        categoryId: value ? Number(value) : undefined,
      }));
    } else {
      setForm((prev: TaskCreateDto) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      categoryId: undefined,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.title.trim()) {
      setError("El título es obligatorio");
      return;
    }

    try {
      setError(null);

      // =========================
      // MODO EDITAR
      // =========================
      if (editingId !== null) {
        const updated = await updateTask(editingId, form);
        setTasks((prev: Task[]) =>
          prev.map((t) => (t.id === editingId ? updated : t))
        );
        resetForm();
        return;
      }

      // =========================
      // MODO CREAR
      // =========================
      const newTask = await createTask(form);
      setTasks((prev: Task[]) => [newTask, ...prev]);
      resetForm();
    } catch (err) {
      console.error(err);
      setError("Error al crear / actualizar la tarea");
    }
  };

  // =========================
  // Eliminar
  // =========================
  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar esta tarea?")) return;

    try {
      await deleteTask(id);
      setTasks((prev: Task[]) => prev.filter((t) => t.id !== id));

      
      if (editingId === id) {
        resetForm();
      }
    } catch (err) {
      console.error(err);
      setError("Error al eliminar la tarea");
    }
  };

  // =========================
  // Editar
  // =========================
  const handleEditClick = (task: Task) => {
    setEditingId(task.id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      categoryId: task.categoryId ?? undefined,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) return <div style={{ padding: 20 }}>Cargando...</div>;

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: 20,
        fontFamily: "system-ui",
      }}
    >
      <h1>Task Manager</h1>
      <p style={{ color: "#bbb" }}>
        Backend: ASP.NET Core + SQL • Frontend: React + TypeScript
      </p>

      {error && (
        <div
          style={{
            background: "#ffe5e5",
            color: "#600",
            padding: 10,
            marginBottom: 16,
            borderRadius: 6,
          }}
        >
          {error}
        </div>
      )}

      {/* FORMULARIO */}
      <section
        style={{
          border: "1px solid #444",
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
          background: "#111",
        }}
      >
        <h2>{editingId ? "Editar tarea" : "Nueva tarea"}</h2>

        <form onSubmit={handleSubmit}>
          {/* Título */}
          <div style={{ marginBottom: 12 }}>
            <label>
              Título* <br />
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 8,
                  background: "#222",
                  color: "#fff",
                  border: "1px solid #555",
                }}
              />
            </label>
          </div>

          {/* Descripción */}
          <div style={{ marginBottom: 12 }}>
            <label>
              Descripción <br />
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={3}
                style={{
                  width: "100%",
                  padding: 8,
                  background: "#222",
                  color: "#fff",
                  border: "1px solid #555",
                }}
              />
            </label>
          </div>

          {/* Categoría */}
          <div style={{ marginBottom: 12 }}>
            <label>
              Categoría <br />
              <select
                name="categoryId"
                value={form.categoryId ?? ""}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: 8,
                  background: "#222",
                  color: "#fff",
                  border: "1px solid #555",
                }}
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                background: "#0d6efd",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              {editingId ? "Actualizar" : "Guardar"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                onClick={resetForm}
                style={{
                  padding: "8px 16px",
                  background: "#444",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </section>

      {/* LISTADO DE TAREAS */}
      <section>
        <h2>Tareas</h2>

        {tasks.length === 0 ? (
          <p>No hay tareas aún.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {tasks.map((t) => (
              <li
                key={t.id}
                style={{
                  border: "1px solid #444",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background:
                    editingId === t.id ? "rgba(13,110,253,0.15)" : "#111",
                }}
              >
                <div>
                  <strong>{t.title}</strong>

                  {t.categoryName && (
                    <span
                      style={{
                        marginLeft: 8,
                        fontSize: 12,
                        color: "#bbb",
                      }}
                    >
                      [{t.categoryName}]
                    </span>
                  )}

                  {t.description && (
                    <div style={{ fontSize: 14, color: "#ccc" }}>
                      {t.description}
                    </div>
                  )}

                  <div style={{ fontSize: 12, color: "#777" }}>
                    Creado: {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "none",
                      cursor: "pointer",
                      background: "#198754",
                      color: "#fff",
                    }}
                    onClick={() => handleEditClick(t)}
                  >
                    Editar
                  </button>

                  <button
                    style={{
                      padding: "4px 10px",
                      borderRadius: 4,
                      border: "none",
                      cursor: "pointer",
                      background: "#dc3545",
                      color: "#fff",
                    }}
                    onClick={() => handleDelete(t.id)}
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default App;
