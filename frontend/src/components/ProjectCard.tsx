interface ProjectCardProps{
    name: string,
    status: string
}

function ProjectCard(props: ProjectCardProps){
    return (
        <div>
            <h1>
                {props.name}
            </h1>
            <p>status: {props.status}</p>
        </div>
    )
}

export default ProjectCard;