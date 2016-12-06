//
//  main.cpp
//  FFD 2D
//
//  Created by Pamela Iupi Peixinho on 8/12/16.
//  Copyright © 2016 PamelaPeixinho. All rights reserved.
//

#include <iostream>

#include <GLUT/glut.h>
#include <OpenGL/gl.h>
#include <OpenGL/glu.h>
#include <OpenGL/glext.h>
#include <vector>
#include <cmath>

using namespace std;

bool transformed = false;

class Point{
    public:
        GLfloat x, y;
        Point(){
        }
        Point(GLfloat x, GLfloat y){
            this->x = x;
            this->y = y;
        }
};

class ControlGrid{
    public:
        GLfloat Xmax = -1, Ymax = -1, Xmin = -1, Ymin = -1;
        vector <Point> controlPoints;
        vector <Point> controlPointsModified;
        GLfloat cR=1, cG=0, cB=0;
        void draw();
        void calculateMaxMin();
        void drawPoints();
        void drawPolygon();
        void reset();
    
};


class ModelPoint{
    // RETHINK THIS
public:
    Point point;
    GLfloat s, t;
    ModelPoint(){}
    void calculateST(ControlGrid controlGrid);
};

void ModelPoint::calculateST(ControlGrid controlGrid){
    this->s = ((this->point.x - controlGrid.Xmin)/(controlGrid.Xmax - controlGrid.Xmin));
    this->t = ((this->point.y - controlGrid.Ymin)/(controlGrid.Ymax - controlGrid.Ymin));
}

void ControlGrid::drawPoints(){
    glColor3f( this->cR, this->cG, this->cB);
    glPointSize(7.0);
    glBegin( GL_POINTS );
    
    for ( int i = 0; i < controlPointsModified.size(); i++){
        glVertex2f( controlPointsModified[i].x, controlPointsModified[i].y);
    }
    
    glEnd();
}

void ControlGrid::drawPolygon(){
    
    glPolygonMode(GL_FRONT_AND_BACK, GL_LINE);
    glColor3d( this->cR, this->cG, this->cB);
    glBegin(GL_POLYGON);
    
    for ( int i = 0; i < controlPointsModified.size(); i++){
        glVertex3f( controlPointsModified[i].x, controlPointsModified[i].y, 0.0);
    }
    
    glEnd();

}

void ControlGrid::reset(){
    this->controlPointsModified = controlPoints;
}

void ControlGrid::draw(){
    this->drawPoints();
    this->drawPolygon();
}

void ControlGrid::calculateMaxMin(){
    this->Xmax = this->Xmax != -1 ? this->Xmax : this->controlPointsModified[0].x;
    this->Xmin = this->Xmin != -1 ? this->Xmin : this->controlPointsModified[0].x;
    this->Ymax = this->Ymax != -1 ? this->Ymax : this->controlPointsModified[0].y;
    this->Ymin = this->Ymin != -1 ? this->Ymin : this->controlPointsModified[0].y;
    
    for (auto &point : this->controlPointsModified){
        this->Xmax = max(this->Xmax, point.x);
        this->Ymax = max(this->Ymax, point.y);
        this->Xmin = min(this->Xmin, point.x);
        this->Ymin = min(this->Ymin, point.y);
    }
}

ControlGrid controlGrid;
vector<ModelPoint> model(4);
vector<ModelPoint> modelModified(4);

void display(void){
    glClearColor(1,1,1, 1);
    glClear(GL_COLOR_BUFFER_BIT);
    
//    glPointSize(7.0);
    glBegin( GL_POLYGON );
        glColor3d(0.0,0.0,1.0f);
        glVertex2d(modelModified[0].point.x, modelModified[0].point.y);
        glVertex2d(modelModified[1].point.x, modelModified[1].point.y);
        glVertex2d(modelModified[2].point.x, modelModified[2].point.y);
        glVertex2d(modelModified[3].point.x, modelModified[3].point.y);
    glEnd();
    
    controlGrid.draw();
    
    glFlush();
}

void calculateSTs(){
    
    for (auto &modelPointM : modelModified){
        modelPointM.calculateST(controlGrid);
//        printf("Point(%f, %f) -> S = %f e T = %f\n", modelPoint.point.x, modelPoint.point.y, modelPoint.s, modelPoint.t);
    }
}


float factorial(int n){
    int fact = 1;
    
    for (int i = n; i > 0; i--){
        fact *= i;
    }
    
    return fact;
}


GLfloat bernstein(float n, float i, float t){
    float binominal, bern;
    binominal = factorial(n) / (factorial(i) * factorial(n - i)) * 1.0;
//    printf("binomial = %f\n", binominal );
    bern = binominal * pow(t, i) * pow((1 - t), (n - i));
    return bern;
}


Point calculateNewPoint(int m, int n, float s, float t, ControlGrid controlGrid){
    Point ffd2;
    Point ffd1;
    float bpT, bpS;
    
    int currentCP = 0;
    float bt = 0, bs = 0;
//    printf("s %f t %f\n", s, t);
    ffd1.x = 0; ffd1.y = 0;
    for (int j = 0; j <= n; j++){
//        printf("j = %d\n", j);
        ffd2.x = 0; ffd2.y = 0; bt = 0;
        for (int i = 0; i <= m; i++){
//            printf("i = %d\n", i);
            bpT = bernstein(m, i, t);

            GLfloat cpX = controlGrid.Xmin + ((i/m*1.0) * (controlGrid.Xmax - controlGrid.Xmin));
            GLfloat cpY = controlGrid.Ymin + ((j/n*1.0) * (controlGrid.Ymax - controlGrid.Ymin));
            ffd2.x = ffd2.x + (bpT * cpX);
            ffd2.y = ffd2.y + (bpT * cpY);
            
//            ffd2.x = ffd2.x + (bpT * controlGrid.controlPointsModified[currentCP].x);
//            ffd2.y = ffd2.y + (bpT * controlGrid.controlPointsModified[currentCP].y);

            //             printf("FFD2 = x %f y %f\n", ffd2.x, ffd2.y);
            currentCP++;
        }
        
        bpS = bernstein(n, j, s);
        bs += (bpS * bt);
//        printf("bps = %f\n", bpS);
        ffd1.x = ffd1.x + (bpS * ffd2.x);
        ffd1.y = ffd1.y + (bpS * ffd2.y);
        
//        ffd1.x = ffd1.x/bs;
//        ffd1.y = ffd1.y/bs;
//        printf("FFD1 = x %f y %f\n", ffd1.x, ffd1.y);
    }
    
    return ffd1;
}


void ffd(int key, int x, int y){
    
    if(key == 13) { //enter
//        gluOrtho2D(20.0f, 100.0f, 20.0f, 100.0f);
//        controlGrid.calculateMaxMin();
        
//        controlGrid.controlPointsModified.at(2) = Point(120, 120);
        controlGrid.calculateMaxMin();
        
        printf("Xmax = %f\n", controlGrid.Xmax);
        printf("Ymax = %f\n", controlGrid.Ymax);
        printf("Xmin = %f\n", controlGrid.Xmin);
        printf("Ymin = %f\n", controlGrid.Ymin);
        
            //calculate berstein points to each point in model
            printf("BEFORE POINT 0 %f %f\n", modelModified[0].point.x, modelModified[0].point.y);
            modelModified[0].point = calculateNewPoint(1, 1, modelModified[0].s, modelModified[0].t, controlGrid);
            printf("AFTER POINT 0 %f %f\n", modelModified[0].point.x, modelModified[0].point.y);
            
            printf("BEFORE POINT 1 %f %f\n", modelModified[1].point.x, modelModified[1].point.y);
            modelModified[1].point = calculateNewPoint(1, 1, modelModified[1].s, modelModified[1].t, controlGrid);
            //        modelModified[1].point.x += np.x;
            //        modelModified[1].point.y += np.y;
            printf("AFTER POINT 1 %f %f\n", modelModified[1].point.x, modelModified[1].point.y);
            
            printf("BEFORE POINT 2 %f %f\n", modelModified[2].point.x, modelModified[2].point.y);
            modelModified[2].point = calculateNewPoint(1, 1, modelModified[2].s, modelModified[2].t, controlGrid);
            //        modelModified[2].point.x += np.x;
            //        modelModified[2].point.y += np.y;
            printf("AFTER POINT 2 %f %f\n", modelModified[2].point.x, modelModified[2].point.y);
            
            printf("BEFORE POINT 3 %f %f\n", modelModified[3].point.x, modelModified[3].point.y);
            modelModified[3].point = calculateNewPoint(1, 1, modelModified[3].s, modelModified[3].t, controlGrid);
            printf("AFTER POINT 3 %f %f\n", modelModified[3].point.x, modelModified[3].point.y);
            //
        
        glutPostRedisplay();
    }
}


void init(){
    
    vector<Point> points(4);
    points[0] = Point(20, 20);
    points[1] = Point(20, 100);
    points[2] = Point(100, 100);
    points[3] = Point(100, 20);
    
//    points[0] = Point(20, 20);
//    points[1] = Point(100, 20);
//    points[2] = Point(100, 100);
//    points[3] = Point(20, 100);
    
    controlGrid.cR = 1;
    controlGrid.cG = 0;
    controlGrid.cB = 0;
    
    controlGrid.controlPoints = points;
    controlGrid.controlPointsModified = points;
    
//    model[0].point = Point(40, 40);
//    model[1].point = Point(40, 80);
//    model[2].point = Point(80, 80);
//    model[3].point = Point(80, 40);

    model[0].point = Point(40, 40);
    model[1].point = Point(80, 40);
    model[2].point = Point(80, 80);
    model[3].point = Point(40, 80);

    modelModified = model;

    controlGrid.calculateMaxMin();
    calculateSTs();

}

void reshape(GLsizei w, GLsizei h){
    gluOrtho2D(0.0f, 120.0f, 0.0f, 120.0f);
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
}


int main(int argc, char **argv) {
    
    glutInit(&argc, argv);
    glutInitDisplayMode(GLUT_SINGLE | GLUT_RGB);
    glutInitWindowSize(400,400);
    glutInitWindowPosition(10, 10);
    glutCreateWindow("FFD 2D");
    glutDisplayFunc(display);
    glutReshapeFunc(reshape);
    glutSpecialFunc(ffd);
    init();
    glutMainLoop();
    return 0;
}
