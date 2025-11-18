import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

interface DiplomaData {
  studentName: string;
  institution: string;
  degree: string;
  teacherName: string;
}

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DiplomaData | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'application/pdf') {
      setFile(droppedFile);
      toast.success('PDF файл загружен');
    } else {
      toast.error('Пожалуйста, загрузите PDF файл');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      toast.success('PDF файл загружен');
    } else {
      toast.error('Пожалуйста, загрузите PDF файл');
    }
  };

  const handleProcess = async () => {
    if (!file) {
      toast.error('Загрузите PDF файл');
      return;
    }

    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockData: DiplomaData = {
        studentName: 'Иванов Иван Иванович',
        institution: 'Московский государственный университет имени М.В. Ломоносова',
        degree: 'Диплом I степени',
        teacherName: 'Петров Петр Петрович'
      };
      
      setData(mockData);
      toast.success('Данные успешно извлечены');
    } catch (error) {
      toast.error('Ошибка при обработке файла');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setData(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8 animate-fade-in">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-semibold tracking-tight text-foreground">
            Анализ дипломов
          </h1>
          <p className="text-muted-foreground text-lg">
            Загрузите PDF диплома для извлечения данных
          </p>
        </div>

        <Card className="border-border/50 shadow-lg animate-scale-in">
          <CardHeader>
            <CardTitle className="text-2xl">Загрузка документа</CardTitle>
            <CardDescription>
              Поддерживается формат PDF
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              className={`
                relative border-2 border-dashed rounded-xl p-12 text-center
                transition-all duration-300 cursor-pointer
                ${isDragging 
                  ? 'border-primary bg-accent/50 scale-[1.02]' 
                  : 'border-border hover:border-primary/50 hover:bg-accent/20'
                }
              `}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept="application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex flex-col items-center space-y-4">
                <div className={`
                  p-4 rounded-full transition-all duration-300
                  ${file 
                    ? 'bg-primary/10 text-primary' 
                    : 'bg-muted text-muted-foreground'
                  }
                `}>
                  <Icon 
                    name={file ? 'CheckCircle' : 'Upload'} 
                    size={40}
                  />
                </div>
                
                <div className="space-y-1">
                  <p className="text-lg font-medium">
                    {file ? file.name : 'Перетащите файл или нажмите для выбора'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Максимальный размер 10 MB'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              {file && (
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex-1"
                >
                  <Icon name="X" size={18} className="mr-2" />
                  Отменить
                </Button>
              )}
              <Button
                onClick={handleProcess}
                disabled={!file || loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={18} className="mr-2 animate-spin" />
                    Обработка...
                  </>
                ) : (
                  <>
                    <Icon name="FileSearch" size={18} className="mr-2" />
                    Извлечь данные
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {data && (
          <Card className="border-primary/20 shadow-lg animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Icon name="Award" size={28} className="text-primary" />
                Результаты
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground font-medium">Участник</p>
                  <p className="text-lg font-semibold">{data.studentName}</p>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground font-medium">Образовательное учреждение</p>
                  <p className="text-lg font-semibold">{data.institution}</p>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground font-medium">Степень диплома</p>
                  <p className="text-lg font-semibold">{data.degree}</p>
                </div>
                
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground font-medium">Преподаватель</p>
                  <p className="text-lg font-semibold">{data.teacherName}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;