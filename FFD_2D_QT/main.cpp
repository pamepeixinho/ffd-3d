#include "mainwindow.h"
#include <QApplication>
#include <glu.h>
//#include <gl>

int main(int argc, char *argv[])
{
    QApplication a(argc, argv);
    MainWindow w;
    w.show();

    return a.exec();
}
