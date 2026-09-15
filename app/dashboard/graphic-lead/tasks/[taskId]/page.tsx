import TaskDetailsPage from "../../components/TaskDetailsPage";

interface PageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { taskId } = await params;

  return <TaskDetailsPage taskId={taskId} />;
}
