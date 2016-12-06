#ifndef GLWIDGET_H
#define GLWIDGET_H

#include <QObject>
#include <QWidget>
#include <qopengl.h>
#include <OpenGL.h>
#include <gl.h>
#include <QGLWidget>

class GLWidget : public QGLWidget
{
    Q_OBJECT
public:
    explicit GLWidget(QWidget *parent);

protected:
  virtual void initializeGL() = 0;
  virtual void resizeGL( int width, int height ) = 0;
  virtual void paintGL() = 0;
};

#endif // GLWIDGET_H
