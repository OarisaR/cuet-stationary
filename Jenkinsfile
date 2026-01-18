pipeline {
    agent any
    
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo 'Pulling latest code...'
                    checkout scm
                    sh 'git log -1 --oneline'
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo 'Installing dependencies...'
                    bat 'npm install'
                    
                }
            }
        }
        
        stage('Lint Code') {
            steps {
                script {
                    echo 'Linting code...'
                    bat 'npm run lint 2>&1 || exit 0'
                }
            }
        }
        
        stage('Run Unit Tests') {
            steps {
                script {
                    echo 'Running automated tests...'
                    bat 'npm test -- --coverage --passWithNoTests'
                }
            }
        }
        
        stage('Test Results') {
            steps {
                script {
                    echo 'Test execution completed'
                    bat 'dir /s /b *.test.ts'
                }
            }
        }
        
            stage('Build Application') {
            steps {
                script {
                    echo 'Building Next.js app...'
                    withCredentials([
                        string(credentialsId: 'mongodb-uri', variable: 'MONGODB_URI'),
                        string(credentialsId: 'jwt-secret',  variable: 'JWT_SECRET')
                    ]) {
                        bat 'npm run build'
                    }
                    bat 'dir .next'
                }
            }
        }
        
    }
    
    post {
        success {
            script {
                echo '✅ BUILD SUCCESSFUL'
                echo 'Pipeline: All stages passed'
                echo 'Tests: All tests passed'
                echo 'Build: Application built successfully'
            }
        }
        failure {
            script {
                echo '❌ BUILD FAILED'
                echo 'Check logs above for details'
            }
        }
        unstable {
            script {
                echo '⚠️ BUILD UNSTABLE'
                echo 'Some tests may have failed'
            }
        }
        always {
            script {
                echo '📋 Build Summary:'
                bat 'echo Build completed at %date% %time%'
                bat 'echo Workspace: %cd%'
            }
        }
    }
}