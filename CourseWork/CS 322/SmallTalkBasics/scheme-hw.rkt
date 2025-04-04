#lang racket

(define (pick my-num a-list)
  (cond
    ((= my-num 0) '())  ;;If trying to find spot zero, return an empty list
    ((null? a-list) '())
    ((= my-num 1) (car a-list))
    (else (pick (- my-num 1) (cdr a-list))))) ;;Recurses the cdr while decrementing the index you're looking for

(define (frontier a-list)
   (cond
     ((null? a-list) '())    ;;If the list is empty, return empty list
     ((not (pair? a-list)) (list a-list))   ;;base case
     (else (append (frontier (car a-list)) (frontier (cdr a-list)))))  ;;Recursion on both sides of the tree to print it out in list form
  )

(define (my-reverse a-list)
  (if(null? a-list) ;;base case - if the list is empty return an empty string
     '()
     (append (my-reverse (cdr a-list))(list(car a-list)))
  ))

(define (deep-reverse a-list)
  (cond
    ((null? a-list) '())  ;;If the list is empty return an empty string
    ((not (pair? a-list)) a-list)  ;;base case
    (else (my-reverse (map deep-reverse a-list))))) ;map deep reverse on the list then my reverse the entire list

(define (reduce lambda a-list primer)
  (if (null? a-list)
      primer      ;;If the list is empty just return the lastest updated primer
      (reduce lambda (cdr a-list) (lambda primer(car a-list)))))  ;;recurses the cdr and updates the primer accoring to lambda and what the car is

(provide pick frontier my-reverse deep-reverse reduce)

