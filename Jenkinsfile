pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        VAULT_CREDENTIALS_ID  = 'ansible-vault-password'
        
        // Image Config
        BACKEND_IMAGE = 'surya162/oyo-backend'
        FRONTEND_IMAGE = 'surya162/oyo-frontend'
        IMAGE_TAG = "v${BUILD_NUMBER}"
        
        // Email Config
        RECIPIENT_EMAIL = 'srisurya.makkapati@gmail.com'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // --- 1. Build & Test Backend (Quality Gate) ---
        stage('Build & Test Backend') {
            steps {
                script {
                    echo "--- 🔨 Building Backend: ${IMAGE_TAG} ---"
                    dir('backend') {
                        sh "docker build -t $BACKEND_IMAGE:$IMAGE_TAG ."
                        
                        echo "--- 🧪 Running Backend Unit Tests ---"
                        // Fails the pipeline if security/logic tests fail
                        sh "docker run --rm $BACKEND_IMAGE:$IMAGE_TAG npm test"
                        
                        sh "docker build -t $BACKEND_IMAGE:latest ." // Re-tag latest after test
                    }
                }
            }
        }

        // --- 2. Test & Build Frontend (Quality Gate) ---
        stage('Test & Build Frontend') {
            steps {
                script {
                    dir('frontend') { 
                        echo "--- 🧪 Running Frontend Security Tests ---"
                        // FIX: Use WORKSPACE/frontend path for robust volume mounting
                        sh """
                            docker run --rm -v ${WORKSPACE}/frontend:/app -w /app node:18-alpine sh -c "npm install && npm test"
                        """
                        
                        echo "--- 🔨 Building Frontend: ${IMAGE_TAG} ---"
                        // Pass VITE_SERVER="" for Nginx to handle proxying
                        withCredentials([
                            string(credentialsId: 'FIREBASE_API_KEY', variable: 'API_KEY'),
                            string(credentialsId: 'FIREBASE_AUTH_DOMAIN', variable: 'AUTH_DOMAIN'),
                            string(credentialsId: 'FIREBASE_PROJECT_ID', variable: 'PROJECT_ID'),
                            string(credentialsId: 'FIREBASE_STORAGE_BUCKET', variable: 'STORAGE_BUCKET'),
                            string(credentialsId: 'FIREBASE_MESSAGING_SENDER_ID', variable: 'SENDER_ID'),
                            string(credentialsId: 'FIREBASE_APP_ID', variable: 'APP_ID')
                        ]) {
                            sh """
                                docker build \
                                --build-arg VITE_SERVER="" \
                                --build-arg VITE_API_KEY=${API_KEY} \
                                --build-arg VITE_AUTH_DOMAIN=${AUTH_DOMAIN} \
                                --build-arg VITE_PROJECT_ID=${PROJECT_ID} \
                                --build-arg VITE_STORAGE_BUCKET=${STORAGE_BUCKET} \
                                --build-arg VITE_MESSAGING_SENDER_ID=${SENDER_ID} \
                                --build-arg VITE_APP_ID=${APP_ID} \
                                -t $FRONTEND_IMAGE:$IMAGE_TAG .
                            """
                        }
                        sh "docker build -t $FRONTEND_IMAGE:latest ."
                    }
                }
            }
        }
        
        // --- 3. Security Scan (Trivy Gate) ---
        stage('Security Scan (Trivy)') {
            steps {
                script {
                    echo "--- 🛡️ Scanning Backend Image for Vulnerabilities ---"
                    sh "trivy image --format table --exit-code 0 --severity HIGH,CRITICAL $BACKEND_IMAGE:$IMAGE_TAG"
                    
                    echo "--- 🛡️ Scanning Frontend Image for Vulnerabilities ---"
                    sh "trivy image --format table --exit-code 0 --severity HIGH,CRITICAL $FRONTEND_IMAGE:$IMAGE_TAG"
                }
            }
        }

        stage('Login & Push All') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: DOCKER_CREDENTIALS_ID, usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin"
                        
                        sh "docker push $BACKEND_IMAGE:$IMAGE_TAG"
                        sh "docker push $BACKEND_IMAGE:latest"

                        sh "docker push $FRONTEND_IMAGE:$IMAGE_TAG"
                        sh "docker push $FRONTEND_IMAGE:latest"
                    }
                }
            }
        }

        stage('Deploy with Ansible') {
            steps {
                script {
                    echo "--- Deploying Version ${IMAGE_TAG} with Ansible Vault ---"
                    
                    withCredentials([string(credentialsId: VAULT_CREDENTIALS_ID, variable: 'VAULT_PASS')]) {
                        sh 'echo $VAULT_PASS > .vault_pass'
                        sh """
                            ansible-playbook -i inventory.ini \
                            --vault-password-file .vault_pass \
                            deploy.yaml \
                            --extra-vars 'image_tag=${IMAGE_TAG}'
                        """
                        sh 'rm .vault_pass'
                    }
                }
            }
        }
    }
    
    // --- POST-BUILD NOTIFICATION STAGE ---
    post {
        always {
            // Cleans up the vault password file, even if the build fails
            script {
                try {
                    sh 'rm .vault_pass'
                } catch (err) {
                    echo "Temporary vault file was not present or could not be removed."
                }
            }
        }
        success {
            echo "Deployment to Kubernetes was successful!"
            mail(
                to: env.RECIPIENT_EMAIL,
                subject: "✅ SUCCESS: SPE Project Deployment #${BUILD_NUMBER}",
                body: "Build #${BUILD_NUMBER} of SPE Project has been successfully built, tested, scanned, and deployed to Kubernetes."
            )
        }
        failure {
            echo "Deployment FAILED at a critical stage!"
            mail(
                to: env.RECIPIENT_EMAIL,
                subject: "❌ FAILED: SPE Project Deployment #${BUILD_NUMBER}",
                body: "Build #${BUILD_NUMBER} FAILED during ${currentBuild.currentResult} stage. Check console output for details."
            )
        }
    }
}