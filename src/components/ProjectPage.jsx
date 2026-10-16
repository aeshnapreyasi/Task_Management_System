import React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProjects() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("http://localhost:3000/api/projects", {
          method: "GET",
          credentials: "include",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch your projects");
        }

        setProjects(data.projects || []);
      } catch (error) {
        console.error("Error in fetching projects:", error);
        setError(error.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  if (loading) {
    return <p> Loading Your Projects..</p>;
  }

  if (error) {
    return <p> Error: {error} </p>;
  }

  return (
    <div>
      <h1> My Dashboard </h1>

      {projects.length === 0 ? (
        <p> No projects found. Create your first project! </p>
      ) : (
        projects.map((project) => (
          <div key={project.id}>
            <h2>{project.name}</h2>
            <p>{project.description || "No description"}</p>
          </div>
        ))
      )}
    </div>
  );
}
