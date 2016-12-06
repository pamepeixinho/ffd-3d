#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

//     virtual void initializeGL() = 0;
//     virtual void resizeGL( int width, int height ) = 0;
//     virtual void paintGL() = 0;

private:
    Ui::MainWindow *ui;
};

#endif // MAINWINDOW_H
